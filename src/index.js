import { Ai } from '@cloudflare/ai'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function handleOptions(request) {
  if (
    request.headers.get('Origin') !== null &&
    request.headers.get('Access-Control-Request-Method') !== null &&
    request.headers.get('Access-Control-Request-Headers') !== null
  ) {
    // Handle CORS pre-flight request.
    return new Response(null, {
      headers: corsHeaders,
    })
  } else {
    // Handle standard OPTIONS request.
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        Allow: 'GET, HEAD, POST, OPTIONS',
      },
    })
  }
}

export default {
  async fetch(request, env, ctx) {
    const ai = new Ai(env.AI, { sessionOptions: { ctx } })

    if (request.method == 'OPTIONS') {
      return handleOptions(request)
    }

    const chat = await request.json()
    const model = chat.model
    const messages = [
      {
        role: 'system',
        content:
          'You are a friendly assistant. You tell the truth and do not make up lies. you just respond with the answer, no other content.',
      },
      ...chat.messages,
    ]
    const resp = await ai.run(model, {
      messages,
      stream: chat.stream || false,
    })

    if (!chat.stream) {
      const output = {
        // id: 'chatcmpl-123',
        object: 'chat.completion',
        created: Date.now(),
        model: chat.model,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: resp.response.trim(),
            },
          },
        ],
      }
      return new Response(JSON.stringify(output), {
        headers: { 'content-type': 'application/json' },
      })
    }

    const { readable, writable } = new TransformStream()

    const writer = writable.getWriter()
    const textEncoder = new TextEncoder()
    const textDecoder = new TextDecoder()

    for await (const part of resp) {
      const text = textDecoder.decode(part)
      const lines = text.split('\n')
      lines.forEach((element) => {
        if (element.includes('[DONE]')) {
          const data = {
            id: 'chatcmpl-123',
            object: 'chat.completion.chunk',
            created: Date.now(),
            model: model,
            choices: [{ index: 0, delta: { role: 'assistant', content: null }, logprobs: null, finish_reason: 'stop' }],
          }
          writer.write(textEncoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        }
        if (element.startsWith('data: ') && element.endsWith('}')) {
          const out = element.replace('data: ', '').trim()
          const json = JSON.parse(out)
          const data = {
            id: 'chatcmpl-123',
            object: 'chat.completion.chunk',
            created: Date.now(),
            model: model,
            choices: [{ index: 0, delta: { role: 'assistant', content: json.response }, logprobs: null, finish_reason: null }],
          }
          writer.write(textEncoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        }
      })
    }

    writer.close()

    return new Response(readable, {
      headers: { 'content-type': 'text/event-stream' },
    })
  },
}

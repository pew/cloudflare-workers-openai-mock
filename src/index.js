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
    console.log(JSON.stringify(chat))
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
        // system_fingerprint: 'fp_44709d6fcb',
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

    return new Response(resp, {
      headers: { 'content-type': 'text/event-stream' },
    })
  },
}

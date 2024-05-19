# OpenAI API mock / proxy Worker

There's now **official Cloudflare (Workers) AI support** for OpenAI comptabile API endpoints, I recommend using this instead: [OpenAI compatible API endpoints](https://developers.cloudflare.com/workers-ai/configuration/open-ai-compatibility/)

---

This project aims to convert/proxy Cloudflare Workers AI responses to OpenAI API compatible responses so that [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) models can be used with any OpenAI/ChatGPT compatible client.

- Supports streaming and non-streaming responses
- Rewrites _default_ models such as `gpt-3` and `gpt-4` to use `@cf/meta/llama-3-8b-instruct`
- If the OpenAI client can be configured to use other model names, simply replace `gpt-4` with the Cloudflare model ID
- Here's a list of all [Cloudflare Workers AI models](https://developers.cloudflare.com/workers-ai/models/)

## installation

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/pew/cloudflare-workers-openai-mock)

1. create a [Cloudflare Account](https://dash.cloudflare.com/)
2. clone this repo
3. run `npm run deploy`
4. generate an API key and add it to your project: `npx wrangler secret put token`

after the script has been deployed, you'll get an URL which you can use as your OpenAI API endpoint for other applications, something like this: `https://openai-api.foobar.workers.dev`

## examples

### use with llm

I mainly created this project to make it work with the awesome [LLM project](https://llm.datasette.io/) from [Simon Willison](https://simonwillison.net/)

- [go ahead and read everything about LLM here](https://llm.datasette.io/)
- [how to install LLM](https://llm.datasette.io/en/stable/setup.html)
- since LLM can work with [OpenAI-compatible models](https://llm.datasette.io/en/stable/openai-models.html#adding-more-openai-models), we're adding our OpenAI API proxy like this:

1. find the directory of your llm configuration: `dirname "$(llm logs path)"`
2. create this file: `vi ~/Library/Application\ Support/io.datasette.llm/extra-openai-models.yaml`

```yaml
- model_id: cloudflare
  model_name: '@hf/thebloke/llama-2-13b-chat-awq'
  api_base: 'https://openai-api.foobar.workers.dev/'
  api_key_name: cloudflare
```

you can also add multiple models there:

```yaml
- model_id: cfllama2
  model_name: '@cf/meta/llama-2-7b-chat-fp16'
  api_base: 'https://openai-api.foobar.workers.dev'
  api_key_name: cloudflare
- model_id: cfllama3
  model_name: '@cf/meta/llama-3-8b-instruct'
  api_base: 'https://openai-api.foobar.workers.dev'
  api_key_name: cloudflare
```

3. set the API key in LLM: `llm keys set cloudflare` to the one you configured in the Worker

use it with streaming (recommended):

```shell
llm chat -m cfllama3
```

use it without streaming:

```shell
llm chat --no-stream -m cfllama3
```

### use with chatblade

[chatblade](https://github.com/npiv/chatblade) is a cool CLI utility for ChatGPT. It was a bit harder to configure to use it with a custom endpoint and model, but this seems to work:

```shell
export OPENAI_API_KEY="your-own-auth-key" # your worker secret api key
export OPENAI_API_AZURE_ENGINE="@cf/meta/llama-3-8b-instruct" # the model you want to use
export OPENAI_API_VERSION="@cf/meta/llama-3-8b-instruct" # again, the model you want to use
export AZURE_OPENAI_ENDPOINT="https://openai-api.foobar.workers.dev/" # your workers endpoint
export OPENAI_API_TYPE=azure # I don't know why this is required
```

use Chatblade like this then:

```shell
chatblade -i -c "@cf/meta/llama-3-8b-instruct" # interactive mode as a chat
chatblade -c "@cf/meta/llama-3-8b-instruct" "tell a joke" # single prompt
```

### use with Pal Chat on iOS

There's [Pal Chat](https://apps.apple.com/us/app/pal-chat-ai-chat-client/id6447545085) for iOS which can be used with custom endpoints.

- settings → modify custom host → `openai-api.foobar.workers.dev` → enter api key
- modify custom model → your model name, for example: `@cf/meta/llama-3-8b-instruct`

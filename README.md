# OpenAI API mock / proxy Worker

This project aims to convert/proxy Cloudflare Workers AI responses to OpenAI API compatible responses so that [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) models can be used with any OpenAI/ChatGPT compatible client.

- Supports streaming and non-streaming responses
- Rewrites *default* models such as `gpt-3` and `gpt-4` to use `@cf/meta/llama-3-8b-instruct`
- If the OpenAI client can be configured to use other model names, simply replace `gpt-4` with the Cloudflare model ID
- Here's a list of all [Cloudflare Workers AI models](https://developers.cloudflare.com/workers-ai/models/)

## installation

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/pew/cloudflare-workers-openai-mock)

1. create a [Cloudflare Account](https://dash.cloudflare.com/)
2. clone this repo
3. run `npm run deploy`

after the script has been deployed, you'll get an URL which you can use as your OpenAI API endpoint for other applications, something like this: `https://openai-api.foobar.workers.dev`

## examples

### use with llm

I mainly created this project to make it work with the awesome [LLM project]((https://llm.datasette.io/)) from [Simon Willison](https://simonwillison.net/)

- [go ahead and read everything about LLM here](https://llm.datasette.io/)
- [how to install LLM](https://llm.datasette.io/en/stable/setup.html)
- since LLM can work with [OpenAI-compatible models](https://llm.datasette.io/en/stable/openai-models.html#adding-more-openai-models), we're adding our OpenAI API proxy like this:

1. find the directory of your llm configuration: `dirname "$(llm logs path)"`
2. create this file: `vi ~/Library/Application\ Support/io.datasette.llm/extra-openai-models.yaml`

```yaml
- model_id: cloudflare
  model_name: '@hf/thebloke/llama-2-13b-chat-awq'
  api_base: 'https://openai-api.foobar.workers.dev/'
```

you can also add multiple models there:

```yaml
- model_id: cfllama2
  model_name: "@cf/meta/llama-2-7b-chat-fp16"
  api_base: "https://openai-api.foobar.workers.dev"
- model_id: cfllama3
  model_name: "@cf/meta/llama-3-8b-instruct"
  api_base: "https://openai-api.foobar.workers.dev"
```

use it with streaming (recommended):

```shell
llm chat -m cfllama3
```

use it without streaming:

```shell
llm chat --no-stream -m cfllama3
```

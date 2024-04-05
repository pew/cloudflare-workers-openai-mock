# openai api mock

this project aims to convert / proxy Cloudflare Workers AI responses to OpenAI API compatible responses so Workers AI models can be used with any OpenAI / ChatGPT compatible client

## installation

tba

## features

- supports streaming and non-streaming responses
- rewrites the different models 'gpt-3' and 'gpt-4' to use `@cf/meta/llama-2-7b-chat-fp16`
- if the openAI client can be configured to provide other model names, just put in the cloudflare model id instead of gpt-4

## use with llm

- [read and install everything about llm here](https://llm.datasette.io/)

create this file `~/Library/Application\ Support/io.datasette.llm/extra-openai-models.yaml`:

```yaml
- model_id: cloudflare
  model_name: '@hf/thebloke/llama-2-13b-chat-awq'
  api_base: 'https://openai-api.foobar.workers.dev/'
```

use it with streaming (recommended):

```shell
llm chat -m cloudflare
```

use it without streaming:

```shell
llm chat --no-stream -m cloudflare
```

# openai api mock

## use with llm

- [this is llm](https://llm.datasette.io/)

create this file `~/Library/Application\ Support/io.datasette.llm/extra-openai-models.yaml`:

```yaml
- model_id: cloudflare
  model_name: "@hf/thebloke/llama-2-13b-chat-awq"
  api_base: "https://openai-api.foobar.workers.dev/"
```

use it:

```shell
llm chat --no-stream -m cloudflare
```

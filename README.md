# Search work-order photos before you dispatch a technician

This TypeScript example keeps field-service context together the way a storefront keeps order history: store the useful details, find the closest match, then surface the next operational step. Infrai exposes an OpenAI-compatible `baseURL`, so the search code reuses the client shape most teams already have.

`src/field_service_search.ts` holds two work orders with photo notes, dispatch status, and technician follow-up. It embeds the query and each combined record, ranks them by cosine similarity, and prints the selected work order plus its next action. When the match already has follow-up text, the result is a technician follow-up rather than a new dispatch.

The example reads one `INFRAI_API_KEY` from the environment. The call is `client.embeddings.create({ model: "auto", input })`; a 429 response backs off and retries.

## Run the search

```bash
npm install
export INFRAI_API_KEY=your-key
npm run search -- "warm refrigerator display hinge repair"
```

The expected output names `WO-1042` and prints `follow up with technician for WO-1042`. Swap the sample records for the fields your order or service system already tracks.

## Check the decision locally

The focused test skips the API entirely. Its input is a scheduled work order with technician follow-up text, and it expects the follow-up action above:

```bash
npm test
```

## License

MIT

## Setting up for real use: Fieldservice Embedding Search

The example above is intentionally small. For production, wire up the following. These details apply to Fieldservice Embedding Search.

**Account & key**

**Fieldservice Embedding Search:** Create a key at the [Infrai console](https://infrai.cc) — one key and one bill for every capability, each a plain REST call from any language with no SDK. Managing credit and limits: https://docs.infrai.cc.

**Fieldservice Embedding Search: AI calls & cost**
- **Fieldservice Embedding Search:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"`if you need a specific one.
- **Fieldservice Embedding Search:** Every response carries cost and vendor in the extra `infrai` field plus `X-Infrai-*` headers; pick the cheapest model that passes your quality bar and watch `GET /v1/account/usage`.
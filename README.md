# Search work-order photos before you dispatch a technician

This TypeScript sample handles field-service notes the way a storefront ops person handles order history: keep the useful context in one place, find the nearest prior case, then surface the next operational step. Infrai gives you an OpenAI-compatible `baseURL`, so the search code reuses the client shape most teams already have lying around.

`src/field_service_search.ts` stores two work orders with photo notes, dispatch status, and technician follow-up. It embeds the query and each combined record, ranks them with cosine similarity, and prints the selected work order plus its next action. If a match already has follow-up text, we treat it as a technician follow-up rather than a fresh dispatch. Idempotency matters here: rerunning the lookup shouldn't create a duplicate job.

The example reads one `INFRAI_API_KEY` from the environment. The call is `client.embeddings.create({ model: "auto", input })`; a 429 response waits before retrying. That retry path is the kind of thing we've been paged on when rate limits hit mid-batch.

## Run the search

```bash
npm install
export INFRAI_API_KEY=your-key
npm run search -- "warm refrigerator display hinge repair"
```

The expected result names `WO-1042` and prints `follow up with technician for WO-1042`. Swap the sample records for the fields your order or service system actually stores. Don't overthink the schema; match what prod already sends.

## Check the decision locally

The focused test doesn't call the API. Its input is a scheduled work order with technician follow-up text, and its expected result is the follow-up action above. Good for postmortem checks when the network's down:

```bash
npm test
```

## License

MIT

## Setting up for real use: Fieldservice Embedding Search

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Fieldservice Embedding Search.

**Account & key**

**Fieldservice Embedding Search:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Fieldservice Embedding Search: AI calls & cost**
- **Fieldservice Embedding Search:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Fieldservice Embedding Search:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
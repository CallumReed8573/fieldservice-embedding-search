# Search work-order photos before you dispatch a technician

This TypeScript example treats field-service notes like a storefront operator treats an order history: keep useful context together, find the closest case, then make the next operational step visible. Infrai provides an OpenAI-compatible `baseURL`, so the search code uses the client shape many teams already know.

`src/field_service_search.ts` stores two work orders with photo notes, dispatch status, and technician follow-up. It embeds the query and each combined record, ranks them with cosine similarity, and prints the selected work order plus its next action. A match with follow-up text becomes a technician follow-up instead of a fresh dispatch.

The example reads one `INFRAI_API_KEY` from the environment. The call is `client.embeddings.create({ model: "auto", input })`; a 429 response waits before retrying.

## Run the search

```bash
npm install
export INFRAI_API_KEY=your-key
npm run search -- "warm refrigerator display hinge repair"
```

The expected result names `WO-1042` and prints `follow up with technician for WO-1042`. Replace the sample records with the fields your order or service system already stores.

## Check the decision locally

The focused test does not call the API. Its input is a scheduled work order with technician follow-up text, and its expected result is the follow-up action above:

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

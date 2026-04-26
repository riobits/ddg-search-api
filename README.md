# Search API (DuckDuckGo Lite + Webshare Rotating Proxy)

A lightweight Bun + Elysia API that queries DuckDuckGo Lite through a rotating proxy and returns normalized search results.

Todos:

- [ ] Add custom IP rotation system

## How It Works

1. Client calls `GET /api/v1/search` with a query string.
2. The server forwards that request to `https://lite.duckduckgo.com/lite` using `ofetch`.
3. Outbound traffic is sent through `WEBSHARE_ROTATING_PROXY`.
4. HTML is parsed with `cheerio`.
5. Sponsored links are removed.
6. The API returns `title`, `description`, and resolved `url` for each result.

## Requirements

- Bun (latest stable)

## Install

```bash
bun install
```

## Get a Webshare Rotating Proxy

Use this referral link to create your Webshare account and get 10 proxies for free:

https://www.webshare.io/?referral_code=t8iktuh8zvi3

After account setup, copy your rotating proxy endpoint and place it in `WEBSHARE_ROTATING_PROXY`.

## Environment Variables (.env)

Create a `.env` file in the project root:

```env
NODE_ENV="development"
WEBSHARE_ROTATING_PROXY="http://username:password@p.webshare.io:80"
```

### Variable Reference

- `WEBSHARE_ROTATING_PROXY` (required)
  - Used for all outbound search requests.
  - If missing, the app throws on startup.
- `NODE_ENV` (optional)
  - If set to `development`, raw DuckDuckGo HTML is written to `search-results.html` for debugging.

## Run

Development (watch mode):

```bash
bun run dev
```

Production:

```bash
bun run start
```

The API listens on `http://localhost:3000`.

## API

### `GET /api/v1/search`

#### Query Parameters

- `q` (required, string): Search query.
- `kl` (optional, string): Region/language code for DuckDuckGo (example: `us-en`).
- `kp` (optional, number): Safe search.
  - `0` = on
  - `-1` = moderate
  - `-2` = off

#### Example Request

```bash
curl "http://localhost:3000/api/v1/search?q=bun%20runtime&kl=us-en&kp=-1"
```

#### Example Response

```json
{
  "success": true,
  "results": [
    {
      "title": "Bun - A fast all-in-one JavaScript runtime",
      "description": "Bun is an all-in-one toolkit for JavaScript and TypeScript apps.",
      "url": "https://bun.sh"
    }
  ]
}
```

## Notes and Behavior

- Sponsored results are filtered out before returning data.
- The API tries to resolve DuckDuckGo redirect links to the final `uddg` destination URL.
- If DuckDuckGo/proxy request fails, the server logs the error and returns an empty array.

## Troubleshooting

- Error: `WEBSHARE_ROTATING_PROXY environment variable is not set`
  - Add `WEBSHARE_ROTATING_PROXY` to your `.env` and restart.
- Empty `results`
  - Verify your proxy credentials and endpoint.
  - Check if DuckDuckGo Lite is reachable through your proxy.

## Project Structure

```text
src/
	index.ts            # API routes and validation
	lib/search.ts       # Upstream fetch + HTML parsing
	errors/AppError.ts  # Shared application error type
	types/ofetch.d.ts   # ofetch proxy typing extension
```

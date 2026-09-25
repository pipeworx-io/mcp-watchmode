# @pipeworx/watchmode

[Watchmode](https://api.watchmode.com/) MCP — streaming availability across 200+ services. Free tier 1000 req/mo.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1679+ live data sources.

## Auth

- Platform: `PLATFORM_WATCHMODE_KEY`. BYO: `?_apiKey=…`.

## Tools

- `title_search(search_value, search_field?, types?)` — search titles
- `title_detail(title_id, append_to_response?)` — title detail (cast, sources, etc.)
- `title_sources(title_id, regions?)` — streaming sources for a title
- `title_seasons(title_id)` — seasons (for series)
- `releases(start_date?, end_date?, limit?, regions?, source_ids?, source_types?, types?, regions_pricing?)` — recent/upcoming releases
- `list_titles(types?, regions?, source_ids?, source_types?, genres?, networks?, release_date_start?, release_date_end?, sort_by?, page?, limit?)` — title catalog
- `sources()` — list streaming sources/services
- `networks()` — list networks
- `genres()` — list genres
- `regions()` — supported regions
- `languages()` — supported languages

## Data source

`https://api.watchmode.com/v1`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "watchmode": {
      "url": "https://gateway.pipeworx.io/watchmode/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/watchmode/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1679+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/title_search \
  -H 'Content-Type: application/json' \
  -d '{"search_value":"Breaking Bad"}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/title_search`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Standalone (no gateway account)

This package also runs as a local stdio MCP server — no Pipeworx account, no
gateway round-trip:

```json
{
  "mcpServers": {
    "watchmode": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-watchmode"]
    }
  }
}
```

Or run it directly to confirm it starts:

```bash
npx -y @pipeworx/mcp-watchmode
```

It speaks MCP over stdin/stdout and answers `initialize`/`tools/list`/`tools/call`
for **only** this pack's tools — none of the shared meta-tools the gateway
connection above adds. Same source, same tools, no ask_pipeworx routing.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Watchmode data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT

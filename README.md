# BuiltWith CLI 🔍

> Non-interactive, scriptable CLI for the [BuiltWith API](https://api.builtwith.com) — designed for automation, CI/CD pipelines, and AI agent consumption.

```bash
bw domain lookup shopify.com --format table
bw domain lookup shopify.com --nopii | jq '.Results[0].Technologies[].Name'
bw live feed --duration 60 > events.ndjson
bw mcp   # start MCP server for Claude Desktop, VS Code, etc.
```

## 🤔 Why this exists

The [BuiltWith TUI](https://github.com/builtwith/builtwith-tui) is great for interactive exploration. This CLI is intentionally different:

- **stdout = data only** (JSON/table/CSV) — safe to pipe anywhere
- **stderr = human output** (spinners, errors, debug info)
- **Structured exit codes** — scripts can distinguish auth failures from rate limits from network errors
- **Multiple auth paths** — works in CI with env vars, locally with rc files, or inline with `--key`

---

## 📦 Installation

```bash
npm install -g builtwith-cli
```

Or run directly without installing:

```bash
npx builtwith-cli domain lookup example.com --key YOUR_KEY
```

Registers as both `bw` (short) and `builtwith` (discoverable).

---

## 🔑 Authentication

API key is resolved in priority order:

| Priority | Method |
|---|---|
| 1 | `--key <value>` CLI flag |
| 2 | `BUILTWITH_API_KEY` environment variable |
| 3 | `.builtwithrc` in current directory |
| 4 | `.builtwithrc` in home directory |

`.env` files in the current directory are loaded automatically, so `BUILTWITH_API_KEY=xxx` in `.env` works too.

**`.builtwithrc` format:**
```json
{"key": "YOUR_API_KEY"}
```

Copy `.builtwithrc.example` to get started:
```bash
cp .builtwithrc.example ~/.builtwithrc
# then edit with your key
```

---

## 💻 Commands

### 🌐 Domain

```bash
bw domain lookup <domain> [flags]
```

| Flag | Description |
|---|---|
| `--nopii` | Exclude PII data |
| `--nometa` | Exclude meta data |
| `--noattr` | Exclude attribution data |
| `--liveonly` | Only currently-live technologies |
| `--fdrange <YYYYMMDD-YYYYMMDD>` | First-detected date range |
| `--ldrange <YYYYMMDD-YYYYMMDD>` | Last-detected date range |

```bash
bw domain lookup shopify.com
bw domain lookup shopify.com --format table
bw domain lookup shopify.com --nopii --liveonly | jq '.Results[0].Technologies[].Name'
bw domain lookup shopify.com --fdrange 20240101-20241231
```

### 📋 Lists

```bash
bw lists tech <tech> [--offset <n>] [--limit <n>]
```

```bash
bw lists tech WordPress
bw lists tech Shopify --limit 50 --offset 100
```

### 🔗 Relationships

```bash
bw relationships lookup <domain>
```

### 🆓 Free

```bash
bw free lookup <domain>
```

### 🏢 Company

```bash
bw company find <name>
```

```bash
bw company find "Shopify"
```

### 🏷️ Tags

```bash
bw tags lookup <lookup>
```

### 💡 Recommendations

```bash
bw recommendations lookup <domain>
```

### ↪️ Redirects

```bash
bw redirects lookup <domain>
```

### 🔤 Keywords

```bash
bw keywords lookup <domain>
```

### 📈 Trends

```bash
bw trends tech <tech>
```

```bash
bw trends tech React
```

### 🛍️ Products

```bash
bw products search <query> [--page <n>] [--limit <n>]
```

```bash
bw products search "coffee maker"
bw products search "running shoes" --page 2 --limit 50
```

### 🛡️ Trust

```bash
bw trust lookup <domain>
```

### 👤 Account

```bash
bw account whoami
bw account usage
```

### 📡 Live Feed

Stream live technology detection events as [NDJSON](https://jsonlines.org/), one event per line.

```bash
bw live feed [--duration <seconds>]
```

```bash
# Stream indefinitely (Ctrl+C to stop)
bw live feed

# Capture 60 seconds of events
bw live feed --duration 60 > events.ndjson

# Pipe to jq in real time
bw live feed | jq --unbuffered '.domain'
```

---

## 🚩 Global Flags

Available on every command:

| Flag | Description |
|---|---|
| `--key <apikey>` | API key (highest priority) |
| `--format <fmt>` | `json` (default) \| `table` \| `csv` |
| `--no-color` | Disable color on stderr |
| `--dry-run` | Print request URL (key masked) and exit |
| `--debug` | Print HTTP metadata to stderr |
| `--quiet` | Suppress spinner/info stderr output |

---

## 🖨️ Output Formats

### JSON (default)

```bash
bw domain lookup example.com | jq '.Results[0].Technologies[].Name'
```

### Table

```bash
bw domain lookup example.com --format table
```

### CSV

```bash
bw domain lookup example.com --format csv > results.csv
```

---

## 🚦 Exit Codes

Scripts can use exit codes to handle different failure modes:

| Code | Meaning |
|---|---|
| `0` | ✅ Success |
| `1` | 💥 Unexpected error |
| `2` | 🔐 Auth failure (missing key, 401, 403) |
| `3` | 🔍 Not found (404) |
| `4` | ⏱️ Rate limit (429) |
| `5` | ⚠️ Other API error |
| `6` | 🌐 Network failure |
| `7` | ❌ Invalid input |
| `8` | 🛑 Interrupted (SIGINT) |

```bash
bw domain lookup example.com
case $? in
  0) echo "success" ;;
  2) echo "check your API key" ;;
  4) echo "rate limited — slow down" ;;
  6) echo "network error" ;;
esac
```

---

## 🔧 Pipeline Examples

```bash
# Get all live tech names for a domain
bw domain lookup shopify.com --liveonly | \
  jq -r '.Results[0].Technologies[].Name' | sort

# Check if a domain uses WordPress
bw domain lookup example.com --quiet --liveonly | \
  jq -e '.Results[0].Technologies[] | select(.Name == "WordPress")' > /dev/null \
  && echo "uses WordPress"

# Export tech stack to CSV
bw domain lookup shopify.com --format csv > shopify-tech.csv

# Capture 5 minutes of live events
bw live feed --duration 300 --quiet > feed.ndjson

# Find all sites using a technology (paginated)
for offset in 0 20 40 60 80; do
  bw domain lists tech React --offset $offset --limit 20 --quiet
done | jq -s 'add'

# CI/CD: fail build if domain check fails
bw domain lookup mysite.com --key "$BUILTWITH_API_KEY" --quiet || exit 1
```

---

## 🐛 Dry Run & Debugging

```bash
# Preview the URL that would be called (key is masked)
bw domain lookup example.com --key MYKEY --dry-run
# → https://api.builtwith.com/v22/api.json?KEY=REDACTED&LOOKUP=example.com

# See HTTP response metadata
bw domain lookup example.com --debug
```

---

## 🤖 MCP Server

`bw mcp` starts a [Model Context Protocol](https://modelcontextprotocol.io) server over stdio, exposing all BuiltWith API endpoints as structured tools that any MCP-compatible client can call — Claude Desktop, VS Code, Cursor, Zed, and more.

```bash
bw mcp
bw mcp --key YOUR_API_KEY   # pass key inline instead of env/rc file
bw mcp --debug              # log JSON-RPC traffic to stderr
```

### ⚙️ Client configuration

Add to your MCP client config (e.g. `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "builtwith": {
      "command": "bw",
      "args": ["mcp"]
    }
  }
}
```

If your API key isn't in an env var or `.builtwithrc`, pass it inline:

```json
{
  "mcpServers": {
    "builtwith": {
      "command": "bw",
      "args": ["mcp", "--key", "YOUR_API_KEY"]
    }
  }
}
```

### 🧰 Available tools

| Tool | Description |
|---|---|
| `domain_lookup` | 🌐 Technology stack for a domain (supports `nopii`, `liveonly`, date ranges) |
| `lists_tech` | 📋 Domains currently using a technology |
| `relationships_lookup` | 🔗 Related domains (shared infra, ownership) |
| `free_lookup` | 🆓 Free-tier category counts for a domain |
| `company_find` | 🏢 Domains associated with a company name |
| `tags_lookup` | 🏷️ Domains related to an IP or tag attribute |
| `recommendations_lookup` | 💡 Technology recommendations for a domain |
| `redirects_lookup` | ↪️ Live and historical redirect chains |
| `keywords_lookup` | 🔤 Keyword data for a domain |
| `trends_tech` | 📈 Historical adoption trend for a technology |
| `products_search` | 🛍️ Search ecommerce products across indexed stores |
| `trust_lookup` | 🛡️ Trust/quality score for a domain |
| `account_whoami` | 👤 Authenticated account identity |
| `account_usage` | 📊 API usage statistics |

### 🔬 Implementation note

The MCP server is implemented as a pure JSON-RPC 2.0 stdio server with no additional dependencies — auth, HTTP calls, and error handling all use the same code paths as the regular CLI commands.

---

## 🛠️ Development

```bash
git clone https://github.com/builtwith/builtwith-cli
cd builtwith-cli
npm install
npm test        # 24 tests, node:test built-in (no extra framework)
```

```bash
# Run without installing globally
node bin/bw.js domain lookup example.com --key YOUR_KEY
```

---

## 🔗 Related

- [BuiltWith TUI](https://github.com/builtwith/builtwith-tui) — interactive terminal UI for the BuiltWith API
- [BuiltWith API Docs](https://api.builtwith.com) — full API reference

---

## 📄 License

MIT

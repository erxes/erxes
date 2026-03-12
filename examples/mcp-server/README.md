# erxes MCP Server Example

This is a working example of an MCP (Model Context Protocol) server that connects Claude AI with your erxes CRM instance.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Get your erxes API token:
- Log into erxes
- Go to Settings → API Keys
- Create a new API key
- Copy the token to `.env`

### 3. Build

```bash
npm run build
```

### 4. Configure Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "erxes": {
      "command": "node",
      "args": ["/absolute/path/to/this/directory/dist/index.js"]
    }
  }
}
```

Or use environment variables:

```json
{
  "mcpServers": {
    "erxes": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "ERXES_GATEWAY_URL": "http://localhost:4000/graphql",
        "ERXES_API_TOKEN": "your_token_here"
      }
    }
  }
}
```

### 5. Restart Claude Desktop

The erxes tools will now be available in Claude!

## Available Tools

- **search_customers** - Search for customers by name, email, or phone
- **get_customer_details** - Get detailed customer information
- **list_deals** - List deals from sales pipeline
- **create_ticket** - Create a new support ticket
- **get_analytics** - Get reports and analytics
- **sync_to_openwork** - Sync data to OpenWork (if configured)

## Usage Examples

### Search for a customer
```
"Find customer with email john@example.com"
```

### Create a ticket
```
"Create a high-priority ticket for payment issue: Customer unable to process credit card"
```

### Get deal information
```
"Show me all deals in the closing stage"
```

## Extending

To add more tools, edit `src/index.ts` and:

1. Add the tool definition to the `TOOLS` array
2. Add the GraphQL query/mutation to `QUERIES` or `MUTATIONS`
3. Create a handler function
4. Add the handler to the switch statement in `CallToolRequestSchema`

## Troubleshooting

### Authentication errors
- Verify your API token is correct
- Check that the erxes gateway URL is accessible
- Ensure the token has the necessary permissions

### Connection errors
- Verify erxes is running on the specified URL
- Check network connectivity
- Review logs for specific error messages

### MCP not showing in Claude
- Verify the config file path is correct
- Check that the absolute path to `dist/index.js` is correct
- Restart Claude Desktop completely
- Check Claude Desktop logs

## Development

Run in development mode:

```bash
npm run dev
```

Test the MCP server:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## OpenWork Integration

To enable OpenWork sync:

1. Set `OPENWORK_API_URL` and `OPENWORK_API_KEY` in `.env`
2. Use the `sync_to_openwork` tool
3. Customize the sync logic in `handleSyncToOpenWork()` based on OpenWork's API

## License

MIT

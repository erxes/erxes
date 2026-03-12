# MCP Integration Guide for erxes

## Overview

This guide explains how to create a Model Context Protocol (MCP) server for erxes and connect it with openwork or other systems. MCP enables AI assistants like Claude to interact with your erxes instance programmatically.

## What is MCP?

Model Context Protocol (MCP) is an open protocol by Anthropic that standardizes how AI assistants connect to data sources and tools. With MCP, you can expose erxes functionality to AI assistants for:

- Customer data queries
- Deal/ticket management
- Analytics and reporting
- Integration orchestration
- Workflow automation

---

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Claude    │ ◄─MCP──► │  MCP Server  │ ◄─API──► │   erxes     │
│  Assistant  │         │  (Node.js)   │         │  Backend    │
└─────────────┘         └──────────────┘         └─────────────┘
                               │
                               │ (Optional)
                               ▼
                        ┌──────────────┐
                        │   OpenWork   │
                        │  Integration │
                        └──────────────┘
```

---

## Part 1: Create MCP Server for erxes

### Step 1: Set Up MCP Server Project

Create a new directory for your MCP server:

```bash
mkdir erxes-mcp-server
cd erxes-mcp-server
npm init -y
```

### Step 2: Install Dependencies

```bash
npm install @modelcontextprotocol/sdk graphql-request dotenv
npm install -D typescript @types/node ts-node
```

### Step 3: Create TypeScript Configuration

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Step 4: Create Environment Configuration

Create `.env`:

```env
# erxes Configuration
ERXES_GATEWAY_URL=http://localhost:4000/graphql
ERXES_API_TOKEN=your_erxes_api_token_here

# OpenWork Configuration (optional)
OPENWORK_API_URL=https://api.openwork.com
OPENWORK_API_KEY=your_openwork_api_key_here

# MCP Server Configuration
MCP_SERVER_PORT=3000
```

### Step 5: Create MCP Server Implementation

Create `src/index.ts`:

```typescript
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { GraphQLClient } from 'graphql-request';
import * as dotenv from 'dotenv';

dotenv.config();

// erxes GraphQL Client
const erxesClient = new GraphQLClient(process.env.ERXES_GATEWAY_URL!, {
  headers: {
    authorization: `Bearer ${process.env.ERXES_API_TOKEN}`,
  },
});

// Define MCP Tools for erxes
const TOOLS: Tool[] = [
  {
    name: 'search_customers',
    description: 'Search for customers in erxes CRM',
    inputSchema: {
      type: 'object',
      properties: {
        searchValue: {
          type: 'string',
          description: 'Search term (name, email, phone)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results',
          default: 10,
        },
      },
      required: ['searchValue'],
    },
  },
  {
    name: 'get_customer_details',
    description: 'Get detailed information about a specific customer',
    inputSchema: {
      type: 'object',
      properties: {
        customerId: {
          type: 'string',
          description: 'The customer ID',
        },
      },
      required: ['customerId'],
    },
  },
  {
    name: 'list_deals',
    description: 'List deals from erxes sales pipeline',
    inputSchema: {
      type: 'object',
      properties: {
        stageId: {
          type: 'string',
          description: 'Filter by pipeline stage',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results',
          default: 20,
        },
      },
    },
  },
  {
    name: 'create_ticket',
    description: 'Create a new ticket in erxes',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Ticket title',
        },
        description: {
          type: 'string',
          description: 'Ticket description',
        },
        customerId: {
          type: 'string',
          description: 'Associated customer ID',
        },
        priority: {
          type: 'string',
          enum: ['Critical', 'High', 'Medium', 'Low'],
          description: 'Ticket priority',
        },
      },
      required: ['name', 'description'],
    },
  },
  {
    name: 'get_analytics',
    description: 'Get analytics and reports from erxes',
    inputSchema: {
      type: 'object',
      properties: {
        reportType: {
          type: 'string',
          enum: ['deals', 'tickets', 'customers', 'revenue'],
          description: 'Type of analytics report',
        },
        startDate: {
          type: 'string',
          description: 'Start date (ISO format)',
        },
        endDate: {
          type: 'string',
          description: 'End date (ISO format)',
        },
      },
      required: ['reportType'],
    },
  },
  {
    name: 'sync_to_openwork',
    description: 'Sync erxes data to OpenWork project management system',
    inputSchema: {
      type: 'object',
      properties: {
        entityType: {
          type: 'string',
          enum: ['deal', 'ticket', 'task'],
          description: 'Type of entity to sync',
        },
        entityId: {
          type: 'string',
          description: 'ID of the entity to sync',
        },
      },
      required: ['entityType', 'entityId'],
    },
  },
];

// GraphQL Queries
const QUERIES = {
  searchCustomers: `
    query CustomersMain($searchValue: String!, $perPage: Int) {
      customersMain(searchValue: $searchValue, perPage: $perPage) {
        list {
          _id
          firstName
          lastName
          primaryEmail
          primaryPhone
          createdAt
          state
        }
      }
    }
  `,
  getCustomerDetails: `
    query CustomerDetail($id: String!) {
      customerDetail(_id: $id) {
        _id
        firstName
        lastName
        primaryEmail
        primaryPhone
        emails
        phones
        state
        createdAt
        modifiedAt
        companies {
          _id
          primaryName
        }
        customFieldsData
        integrationId
      }
    }
  `,
  listDeals: `
    query Deals($stageId: String, $perPage: Int) {
      deals(stageId: $stageId, perPage: $perPage) {
        _id
        name
        amount
        stage {
          _id
          name
        }
        customers {
          _id
          firstName
          lastName
        }
        closeDate
        createdAt
      }
    }
  `,
};

// GraphQL Mutations
const MUTATIONS = {
  createTicket: `
    mutation TicketsAdd($name: String!, $description: String, $customerIds: [String], $priority: String) {
      ticketsAdd(name: $name, description: $description, customerIds: $customerIds, priority: $priority) {
        _id
        name
        status
        priority
      }
    }
  `,
};

// Tool Handlers
async function handleSearchCustomers(args: any) {
  const { searchValue, limit = 10 } = args;
  const data = await erxesClient.request(QUERIES.searchCustomers, {
    searchValue,
    perPage: limit,
  });
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data.customersMain.list, null, 2),
      },
    ],
  };
}

async function handleGetCustomerDetails(args: any) {
  const { customerId } = args;
  const data = await erxesClient.request(QUERIES.getCustomerDetails, {
    id: customerId,
  });
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data.customerDetail, null, 2),
      },
    ],
  };
}

async function handleListDeals(args: any) {
  const { stageId, limit = 20 } = args;
  const data = await erxesClient.request(QUERIES.listDeals, {
    stageId,
    perPage: limit,
  });
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data.deals, null, 2),
      },
    ],
  };
}

async function handleCreateTicket(args: any) {
  const { name, description, customerId, priority = 'Medium' } = args;
  const customerIds = customerId ? [customerId] : undefined;

  const data = await erxesClient.request(MUTATIONS.createTicket, {
    name,
    description,
    customerIds,
    priority,
  });

  return {
    content: [
      {
        type: 'text',
        text: `Ticket created successfully: ${JSON.stringify(data.ticketsAdd, null, 2)}`,
      },
    ],
  };
}

async function handleGetAnalytics(args: any) {
  const { reportType, startDate, endDate } = args;

  // Implement analytics queries based on reportType
  // This is a placeholder - customize based on your erxes setup
  return {
    content: [
      {
        type: 'text',
        text: `Analytics for ${reportType} from ${startDate || 'all time'} to ${endDate || 'now'}`,
      },
    ],
  };
}

async function handleSyncToOpenWork(args: any) {
  const { entityType, entityId } = args;

  // Fetch entity from erxes
  let entityData;
  if (entityType === 'deal') {
    const query = `
      query DealDetail($id: String!) {
        dealDetail(_id: $id) {
          _id
          name
          amount
          description
          closeDate
        }
      }
    `;
    const result = await erxesClient.request(query, { id: entityId });
    entityData = result.dealDetail;
  } else if (entityType === 'ticket') {
    const query = `
      query TicketDetail($id: String!) {
        ticketDetail(_id: $id) {
          _id
          name
          description
          priority
          status
        }
      }
    `;
    const result = await erxesClient.request(query, { id: entityId });
    entityData = result.ticketDetail;
  }

  // Sync to OpenWork (implement based on OpenWork API)
  if (process.env.OPENWORK_API_URL && process.env.OPENWORK_API_KEY) {
    // Example: POST to OpenWork API
    const response = await fetch(`${process.env.OPENWORK_API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENWORK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: entityData.name,
        description: entityData.description,
        source: 'erxes',
        sourceId: entityData._id,
        type: entityType,
      }),
    });

    const openworkTask = await response.json();

    return {
      content: [
        {
          type: 'text',
          text: `Successfully synced ${entityType} ${entityId} to OpenWork: ${JSON.stringify(openworkTask, null, 2)}`,
        },
      ],
    };
  }

  return {
    content: [
      {
        type: 'text',
        text: 'OpenWork integration not configured. Set OPENWORK_API_URL and OPENWORK_API_KEY.',
      },
    ],
  };
}

// Main Server
const server = new Server(
  {
    name: 'erxes-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool list handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Register tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'search_customers':
        return await handleSearchCustomers(args);
      case 'get_customer_details':
        return await handleGetCustomerDetails(args);
      case 'list_deals':
        return await handleListDeals(args);
      case 'create_ticket':
        return await handleCreateTicket(args);
      case 'get_analytics':
        return await handleGetAnalytics(args);
      case 'sync_to_openwork':
        return await handleSyncToOpenWork(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('erxes MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
```

### Step 6: Update package.json

Add to `package.json`:

```json
{
  "name": "erxes-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "erxes-mcp-server": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts"
  }
}
```

### Step 7: Build the Server

```bash
npm run build
```

---

## Part 2: Configure Claude Desktop to Use MCP Server

### For macOS/Linux

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "erxes": {
      "command": "node",
      "args": ["/path/to/erxes-mcp-server/dist/index.js"],
      "env": {
        "ERXES_GATEWAY_URL": "http://localhost:4000/graphql",
        "ERXES_API_TOKEN": "your_token_here",
        "OPENWORK_API_URL": "https://api.openwork.com",
        "OPENWORK_API_KEY": "your_openwork_key"
      }
    }
  }
}
```

### For Windows

Edit `%APPDATA%\Claude\claude_desktop_config.json` with the same configuration.

---

## Part 3: Get erxes API Token

### Option 1: Via GraphQL Mutation

```graphql
mutation {
  login(email: "your@email.com", password: "yourpassword") {
    token
    refreshToken
  }
}
```

### Option 2: From erxes Settings

1. Log into erxes admin panel
2. Go to Settings → Integrations → API Keys
3. Create a new API key with appropriate permissions
4. Copy the token

---

## Part 4: OpenWork Integration

### OpenWork Webhook Configuration

If OpenWork supports webhooks, configure it to send events to erxes:

Create `src/openwork-webhook.ts`:

```typescript
import express from 'express';
import { GraphQLClient } from 'graphql-request';

const app = express();
app.use(express.json());

const erxesClient = new GraphQLClient(process.env.ERXES_GATEWAY_URL!);

// Webhook endpoint for OpenWork
app.post('/webhooks/openwork', async (req, res) => {
  const { event, data } = req.body;

  try {
    switch (event) {
      case 'task.created':
        // Create corresponding item in erxes
        await createErxesTicket(data);
        break;
      case 'task.updated':
        // Update erxes item
        await updateErxesTicket(data);
        break;
      case 'task.completed':
        // Mark as done in erxes
        await completeErxesTicket(data);
        break;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function createErxesTicket(openworkData: any) {
  const mutation = `
    mutation TicketsAdd($name: String!, $description: String) {
      ticketsAdd(
        name: $name
        description: $description
        customFieldsData: [{
          field: "openworkTaskId"
          value: "${openworkData.id}"
        }]
      ) {
        _id
      }
    }
  `;

  await erxesClient.request(mutation, {
    name: openworkData.title,
    description: openworkData.description,
  });
}

app.listen(3001, () => {
  console.log('OpenWork webhook server running on port 3001');
});
```

---

## Part 5: Usage Examples

### Example 1: Search Customers via Claude

```
User: "Search for customers with email john@example.com"

Claude uses search_customers tool →
Returns customer list from erxes
```

### Example 2: Create Ticket and Sync to OpenWork

```
User: "Create a high-priority ticket for the payment issue and sync it to OpenWork"

Claude:
1. Uses create_ticket tool → Creates ticket in erxes
2. Uses sync_to_openwork tool → Creates task in OpenWork
3. Returns confirmation with IDs
```

### Example 3: Get Deal Analytics

```
User: "Show me all deals closed this month"

Claude uses get_analytics tool →
Returns deal statistics from erxes
```

---

## Part 6: Advanced Features

### Add Real-time Notifications

Extend MCP server with GraphQL subscriptions:

```typescript
import { createClient } from 'graphql-ws';
import WebSocket from 'ws';

const wsClient = createClient({
  url: 'ws://localhost:4000/graphql',
  webSocketImpl: WebSocket,
});

// Subscribe to new tickets
wsClient.subscribe(
  {
    query: `
      subscription {
        ticketInserted {
          _id
          name
          priority
        }
      }
    `,
  },
  {
    next: (data) => {
      console.log('New ticket:', data);
      // Optionally notify OpenWork
    },
    error: (err) => console.error(err),
    complete: () => console.log('Subscription complete'),
  }
);
```

### Add Custom Resources

Expose erxes data as MCP resources:

```typescript
import { ListResourcesRequestSchema, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js';

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'erxes://pipelines',
        name: 'Sales Pipelines',
        mimeType: 'application/json',
      },
      {
        uri: 'erxes://customers/recent',
        name: 'Recent Customers',
        mimeType: 'application/json',
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === 'erxes://pipelines') {
    const data = await erxesClient.request(`
      query {
        dealStages {
          _id
          name
          pipelineId
        }
      }
    `);

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(data.dealStages, null, 2),
        },
      ],
    };
  }
});
```

---

## Part 7: Testing

### Test MCP Server Locally

```bash
# Install MCP Inspector
npm install -g @modelcontextprotocol/inspector

# Run inspector
mcp-inspector node dist/index.js
```

### Test GraphQL Queries

```bash
# Test customer search
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query": "query { customersMain(searchValue: \"test\") { list { _id firstName lastName } } }"}'
```

---

## Part 8: Deployment

### Deploy MCP Server as System Service

Create `/etc/systemd/system/erxes-mcp.service`:

```ini
[Unit]
Description=erxes MCP Server
After=network.target

[Service]
Type=simple
User=erxes
WorkingDirectory=/opt/erxes-mcp-server
ExecStart=/usr/bin/node /opt/erxes-mcp-server/dist/index.js
Restart=on-failure
Environment=ERXES_GATEWAY_URL=http://localhost:4000/graphql
Environment=ERXES_API_TOKEN=your_token

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable erxes-mcp
sudo systemctl start erxes-mcp
```

---

## Security Best Practices

1. **Use Environment Variables** - Never hardcode credentials
2. **API Token Rotation** - Regularly rotate erxes API tokens
3. **Rate Limiting** - Implement rate limits on MCP endpoints
4. **Audit Logging** - Log all MCP tool invocations
5. **Access Control** - Restrict MCP server to authorized users only
6. **HTTPS Only** - Use SSL/TLS for all API communications

---

## Troubleshooting

### MCP Server Not Connecting

```bash
# Check logs
journalctl -u erxes-mcp -f

# Test GraphQL endpoint
curl http://localhost:4000/graphql
```

### Authentication Errors

```bash
# Verify token
echo $ERXES_API_TOKEN

# Test with curl
curl -H "Authorization: Bearer $ERXES_API_TOKEN" http://localhost:4000/graphql
```

### OpenWork Sync Failures

- Verify API key is valid
- Check network connectivity
- Review OpenWork API documentation for rate limits

---

## Next Steps

1. ✅ Set up basic MCP server
2. ✅ Configure authentication
3. ✅ Test with Claude Desktop
4. ⬜ Implement bidirectional sync with OpenWork
5. ⬜ Add real-time notifications
6. ⬜ Deploy to production
7. ⬜ Set up monitoring and alerting

---

## Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [erxes API Documentation](https://docs.erxes.io)
- [erxes GraphQL Playground](http://localhost:4000/graphql)
- [OpenWork API Docs](https://docs.openwork.com) (if available)

---

## Support

For issues:
- erxes MCP Server: Create issue in your repository
- erxes Platform: https://github.com/erxes/erxes/issues
- MCP Protocol: https://github.com/anthropics/mcp

---

*Last Updated: 2026-03-12*

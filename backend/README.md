# Accounting Backend

A Node.js backend service for managing accounting operations and configurations.

## Project Structure

```
backend/
├── core-api/           # Core API service
├── gateway/           # API Gateway
├── libs/              # Shared libraries
└── mq-dashboard/      # Message Queue Dashboard
```

## Core API Service

The core API service handles all accounting-related operations.

### Features

- Main settings management
- Currency configuration
- Tax settings (VAT and CTax)
- Account mapping
- GraphQL API
- TypeScript support
- MongoDB integration

### API Endpoints

#### GraphQL API

##### Queries

```graphql
query GetMainConfigs {
  getMainConfigs {
    MainCurrency
    HasVat
    VatPayableAccount
    VatReceivableAccount
    VatAfterPayableAccount
    VatAfterReceivableAccount
    HasCtax
    CtaxPayableAccount
  }
}

query GetAccounts($journal: String) {
  getAccounts(journal: $journal) {
    _id
    name
    code
    type
  }
}
```

##### Mutations

```graphql
mutation UpdateMainConfigs($input: MainConfigsInput!) {
  updateMainConfigs(input: $input) {
    MainCurrency
    HasVat
    VatPayableAccount
    VatReceivableAccount
    VatAfterPayableAccount
    VatAfterReceivableAccount
    HasCtax
    CtaxPayableAccount
  }
}
```

### Data Models

#### MainConfigs

```typescript
interface MainConfigs {
  MainCurrency: string;
  HasVat: boolean;
  VatPayableAccount?: string;
  VatReceivableAccount?: string;
  VatAfterPayableAccount?: string;
  VatAfterReceivableAccount?: string;
  HasCtax: boolean;
  CtaxPayableAccount?: string;
}
```

### Services

#### ConfigsService

Handles configuration management:

```typescript
class ConfigsService {
  async getMainConfigs(): Promise<MainConfigs>;
  async updateMainConfigs(input: MainConfigsInput): Promise<MainConfigs>;
}
```

#### AccountsService

Manages account-related operations:

```typescript
class AccountsService {
  async getAccounts(journal?: string): Promise<Account[]>;
}
```

## API Gateway

The API Gateway provides:

- Request routing
- Authentication
- Rate limiting
- Request/Response transformation
- Error handling

## Shared Libraries

### Common Utilities

- Type definitions
- Validation schemas
- Helper functions
- Constants

### Database Models

- MongoDB schemas
- TypeScript interfaces
- Validation rules

## Message Queue Dashboard

Monitors and manages message queues:

- Queue status
- Message processing
- Error tracking
- Performance metrics

## Development Setup

1. Install dependencies:

```bash
pnpm install
```

2. Set up environment variables:

```bash
cp .env.sample .env
```

3. Start development servers:

```bash
# Start core API
pnpm dev:core-api

# Start gateway
pnpm dev:gateway

# Start MQ dashboard
pnpm dev:mq-dashboard
```

## Testing

```bash
# Run all tests
pnpm test

# Run specific service tests
pnpm test:core-api
pnpm test:gateway
```

## Database

### MongoDB Collections

- `configs`: Stores system configurations
- `accounts`: Stores account information
- `transactions`: Stores transaction records

### Indexes

```typescript
// configs collection
db.configs.createIndex({ MainCurrency: 1 });

// accounts collection
db.accounts.createIndex({ code: 1 }, { unique: true });
db.accounts.createIndex({ journal: 1 });
```

## Error Handling

The backend implements a standardized error handling system:

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}
```

Common error codes:

- `INVALID_INPUT`: Invalid request data
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `INTERNAL_ERROR`: Server error

## Security

- JWT authentication
- Role-based access control
- Input validation
- Rate limiting
- CORS configuration
- Security headers

## Performance Optimization

- Database indexing
- Query optimization
- Caching strategies
- Connection pooling
- Request batching

## Monitoring

- Health checks
- Performance metrics
- Error tracking
- Usage statistics
- Logging system

## Contributing

1. Follow TypeScript best practices
2. Write unit tests for new features
3. Update documentation
4. Follow the established code style
5. Create feature branches
6. Submit pull requests

## License

[Your License Here]

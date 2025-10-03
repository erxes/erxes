# Accounting UI Plugin (Frontend)

A Next.js plugin for managing accounting settings and configurations with a modern UI built using Shadcn UI and Tailwind CSS.

## Features

- Main settings management
- Currency configuration
- Tax settings (VAT and CTax)
- Account mapping for tax transactions
- Form validation using Zod
- Responsive design
- Real-time form updates
- Optimized performance

## Project Structure

```
src/
├── modules/
│   └── settings/
│       ├── components/     # React components
│       │   ├── MainSettingsForm.tsx
│       │   ├── VatFormFields.tsx
│       │   └── CtaxFormFields.tsx
│       ├── constants/      # Constants and schemas
│       │   └── mainSettingsSchema.ts
│       ├── graphql/        # GraphQL queries and mutations
│       ├── hooks/          # Custom React hooks
│       │   ├── useMainConfigs.ts
│       │   └── useUpdateConfig.ts
│       └── types/          # TypeScript type definitions
```

## Components

### MainSettingsForm

The main form component for managing accounting settings. It includes:

- General settings section
  - Main currency selection
- Tax settings section
  - VAT configuration
  - CTax configuration

#### Props

None (self-contained component)

#### Usage

```typescript
import { MainSettingsForm } from '@/modules/settings/components/MainSettingsForm';

export default function SettingsPage() {
  return (
    <div className="container mx-auto">
      <MainSettingsForm />
    </div>
  );
}
```

### VatFormFields

Manages VAT-related settings including:

- VAT toggle
- VAT account payable
- VAT account receivable
- VAT after account payable
- VAT after account receivable

#### Props

```typescript
{
  form: UseFormReturn<TMainSettings>;
}
```

### CtaxFormFields

Manages CTax-related settings including:

- CTax toggle
- CTax account payable

#### Props

```typescript
{
  form: UseFormReturn<TMainSettings>;
}
```

## Data Schema

The main settings are validated using Zod schema:

```typescript
{
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

## Hooks

### useMainConfigs

Custom hook for fetching main configuration settings.

#### Returns

```typescript
{
  configs: TMainSettings | null;
  loading: boolean;
}
```

### useUpdateConfig

Custom hook for updating configuration settings.

#### Returns

```typescript
{
  updateConfigs: (data: TMainSettings) => Promise<void>;
}
```

## GraphQL Integration

The plugin uses GraphQL for data fetching and mutations:

### Queries

- `getMainConfigs`: Fetches main configuration settings
- `getAccounts`: Fetches available accounts for tax mapping

### Mutations

- `updateMainConfigs`: Updates main configuration settings

## Dependencies

- Next.js
- React Hook Form
- Zod
- Shadcn UI
- Tailwind CSS
- Erxes UI Components
- GraphQL Client

## Best Practices

1. Form Validation

   - All forms use Zod for schema validation
   - React Hook Form for form state management
   - Real-time validation feedback

2. Performance

   - Components are optimized to prevent unnecessary re-renders
   - Form updates are batched for better performance
   - Memoized callbacks and values
   - Efficient state management

3. Type Safety

   - Full TypeScript support
   - Zod schema validation
   - Strict type checking
   - Proper error handling

4. UI/UX
   - Responsive design using Tailwind CSS
   - Consistent styling with Shadcn UI
   - Collapsible sections for better organization
   - Loading states and error handling
   - Form feedback and validation messages

## Contributing

1. Follow the TypeScript and React best practices
2. Use functional components with hooks
3. Implement proper form validation
4. Add appropriate error handling
5. Include TypeScript types for all new features
6. Write unit tests for new components
7. Follow the established code style

## Development Setup

1. Install dependencies:

```bash
pnpm install
```

2. Start development server:

```bash
pnpm dev
```

3. Build for production:

```bash
pnpm build
```

## Testing

```bash
pnpm test
```

## License

[Your License Here]

# `mongolian_api` Plugin Guide

## Identity

- **Plugin:** `mongolian`
- **Project:** `mongolian_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/mongolian_api`
- **Last synchronized:** `2026-08-10`

## Scope

### Owns

- Mongolian eBarimt, Erkhet, exchange-rate, MS Dynamics, and product-place integrations.
- Plugin-owned configuration, GraphQL, tRPC, subscription, and tenant data behavior for those integrations.

### Does not own

- Core contacts, companies, deals, stages, relations, or transactional email delivery infrastructure.
- Frontend routes or UI behavior.

## Current Capabilities

- Creates, queries, returns, and reports eBarimt receipts and manages eBarimt product rules and groups.
- Processes configured sales stage changes and emails successful eBarimt receipts to related customers and companies.
- Renders each emailed eBarimt QR code as a CID-referenced inline PNG without a PDF attachment.
- Provides Erkhet, exchange-rate, MS Dynamics, and product-place integration behavior.

## Architecture

| Area               | Path                                                | Responsibility                                                                                       |
| ------------------ | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Runtime            | `backend/plugins/mongolian_api/src/main.ts`         | Starts the `mongolian` plugin and registers GraphQL, tRPC, subscriptions, models, and metadata.      |
| eBarimt            | `backend/plugins/mongolian_api/src/modules/ebarimt` | Owns receipt persistence, API integration, stage processing, queries, mutations, and receipt emails. |
| Other integrations | `backend/plugins/mongolian_api/src/modules`         | Owns Erkhet, exchange-rate, MS Dynamics, product-place, and plugin configuration modules.            |

## Contracts

### Provides

- Plugin-prefixed GraphQL operations and subscriptions for Mongolian integration features.
- Plugin tRPC routes registered through the `mongolian` service.
- Stage-triggered eBarimt receipt emails containing CID-referenced inline PNG QR images.

### Consumes

- `erxes-api-shared` plugin runtime, messaging, and utility APIs.
- Published core tRPC contracts for relations, contacts, companies, stages, products, and notifications.
- External eBarimt and other configured integration endpoints.

## Data and State

- Generates tenant-scoped Mongoose models per request subdomain.
- Owns eBarimt receipt, product-rule, product-group, configuration, and other integration collections defined inside this plugin.
- Resolves email recipients through core relations without reading core collections directly.

## Local Invariants

- Every model and service operation must retain the request subdomain and tenant-scoped models.
- Cross-service access must use published GraphQL, tRPC, event, or subscription contracts.
- eBarimt stage-change email sends only successful receipt responses and only to related contacts with primary email addresses.
- Each receipt QR `cid:` reference must match exactly one inline `image/png` attachment CID.
- A QR rendering failure must not prevent the remaining receipt content from being emailed.

## Validation

- `pnpm nx lint mongolian_api`
- `pnpm nx build mongolian_api`
- Move a deal into a configured eBarimt stage and verify that each successful receipt email displays its QR inline without a PDF attachment.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-10` — `Render eBarimt QR codes inline`

- **Summary:** eBarimt stage-change emails now render receipt QR codes through CID-referenced inline PNG parts instead of embedded data URLs or PDF attachments.
- **Affected areas:** `src/modules/ebarimt/sendEbarimtEmail.ts`, transactional receipt email rendering
- **Contracts changed:** Core email attachment input and shared email provider attachments accept an optional `cid` value.

# `mongolian_api` Plugin Guide

## Identity

- **Plugin:** `mongolian`
- **Project:** `mongolian_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/mongolian_api`
- **Last synchronized:** `2026-08-31`

## Scope

### Owns

- Mongolian-specific backend APIs for ebarimt, Erkhet sync logs, MS Dynamic helpers, product places, plugin configs, permissions, and exchange rates.

### Does not own

- Accounting transaction persistence, journal rules, or accounting migration orchestration.
- Core users, products, branches, departments, organization configs, or contacts.
- Frontend UI routes or presentation.

## Current Capabilities

- Starts the `mongolian` plugin service on port `3313`.
- Provides GraphQL and tRPC contracts for exchange-rate create, update, find-one, list, remove, and active-rate lookup.
- Stores exchange-rate rows in the tenant-scoped `exchange_rates` Mongo collection, one document per `date + mainCurrency + rateCurrency`.
- Resolves active exchange rates by selecting the latest row whose `date` is less than or equal to the requested date.
- Provides ebarimt, product-place, config, Erkhet sync-log, and MS Dynamic backend capabilities through plugin-owned modules.

## Architecture

| Area              | Path                                    | Responsibility                                                |
| ----------------- | --------------------------------------- | ------------------------------------------------------------- |
| Runtime           | `src/main.ts`                           | Starts the Mongolian API plugin and registers GraphQL/tRPC.   |
| Models            | `src/connectionResolvers.ts`            | Generates tenant-scoped Mongoose models.                      |
| Exchange rates    | `src/modules/exchangeRates`             | Owns exchange-rate schema, models, GraphQL, and tRPC.         |
| Ebarimt           | `src/modules/ebarimt`                   | Owns ebarimt API behavior and related product rules/groups.   |
| Configs           | `src/modules/configs`                   | Owns Mongolian plugin configuration storage.                  |
| Erkhet sync logs  | `src/modules/erkhet`                    | Owns Mongolian plugin Erkhet sync-log records.                |
| MS Dynamic        | `src/modules/msdynamic`                 | Owns MS Dynamic integration helpers and logs.                 |
| Product places    | `src/modules/productPlaces`             | Owns product-place tRPC behavior.                             |

## Contracts

### Provides

- GraphQL exchange-rate queries and mutations: `exchangeRatesMain`, `exchangeGetRate`, `exchangeRateAdd`, `exchangeRateEdit`, and `exchangeRatesRemove`.
- tRPC exchange-rate procedures under `exchangeRates`: `findOne`, `create`, `update`, and `getActiveRate`.
- `exchangeRates.getActiveRate` accepts a Date-coercible `date` value, plus `rateCurrency` and optional `mainCurrency`.

### Consumes

- Core organization config `mainCurrency` through public tRPC when `mainCurrency` is not provided.
- Shared backend utilities, startup, Mongoose helpers, pagination constants, and service-to-service messaging from `erxes-api-shared`.

## Data and State

- All models are tenant-scoped through `generateModels(subdomain)`.
- Exchange rates are stored in `exchange_rates` with `date`, `mainCurrency`, `rateCurrency`, `rate`, `createdAt`, and `modifiedAt`.
- Exchange-rate indexes cover `{ mainCurrency, rateCurrency, date }` and `{ rateCurrency, date }`.
- Other plugin-owned collections include `mongolian_configs`, `putresponses`, `ebarimt_product_rules`, `ebarimt_product_groups`, `syncerkhet_synclogs`, `msdynamics_synclogs`, and `msdynamics_customer_relation`.

## Local Invariants

- Exchange-rate lookup accepts Date-coercible values because service-to-service tRPC calls serialize JavaScript `Date` values over HTTP.
- Active-rate lookup must return the latest rate on or before the requested day.
- One exchange-rate document represents exactly one main/rate currency pair for one day.
- Do not add debug `console.log` calls to exchange-rate tRPC handlers; service-to-service failures should surface through caller validation or returned errors.
- Plugin data access must remain tenant-scoped through generated models.

## Validation

- `pnpm nx build mongolian_api`
- `pnpm build`
- Smoke scenario: create or upsert exchange-rate rows for multiple foreign currencies on the same date, then call `exchangeRates.getActiveRate` with a `Date` and verify the latest matching row is returned.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-31` — `Exchange Rate TRPC Cleanliness`

- **Summary:** Exchange-rate tRPC active-rate lookup now accepts Date-coercible input so service-to-service callers can pass serialized dates.
- **Affected areas:** `src/modules/exchangeRates/trpc/exchangeRate.ts`.
- **Contracts changed:** `exchangeRates.getActiveRate` now coerces incoming `date` values to `Date`.

# `storage_api` Plugin Guide

## Identity

- **Plugin:** `storage`
- **Project:** `storage_api`
- **Layer:** Backend API
- **Path:** `backend/plugins/storage_api`
- **Last synchronized:** `2026-11-16`

## Scope

### Owns

- Warehouse stock for MMS: sealed (RFID) and open zones, receiving, issuing and box breaking.
- RFID tag records (96-bit EPC, 24 hex characters) and their sealed/opened state.
- Tech cards (kit ↔ component conversion), work orders with material cost lines and completion-% close.
- Tool custody (two-way handover, repair, in-service date for depreciation).
- e-Barimt ↔ VAT payable reconciliation.
- Stock movement ledger and period close/reopen for this plugin's postings.

### Does not own

- Products, branches, departments and users (core).
- General ledger, inventories, fixed assets and VAT rows in `accounting_api`; this plugin does not post to them.
- RFID reader hardware input; no reader ingest endpoint exists yet.

## Current Capabilities

- Receive stock with optional RFID tag generation (bounded, chunked inserts).
- Issue stock to an active work order, with optional automatic kit assembly or disassembly.
- Break a sealed box into the open zone, optionally by scanned EPC.
- Close work-order cost lines to a cumulative completion %; reopen a single line.
- Initiate and accept tool handovers; send tools to repair.
- Auto-match (indexed, batched) and manually match e-Barimt receipts to VAT payables.
- Close and reopen periods; postings dated inside a closed period are rejected.

## Architecture

| Area | Path | Responsibility |
| --- | --- | --- |
| Entry | `backend/plugins/storage_api/src/main.ts` | `startPlugin` config, context, permissions meta |
| Models | `backend/plugins/storage_api/src/modules/storage/db/models/Storage.ts` | Mongoose schemas, `IModels`, `loadClasses` |
| Movement ledger | `backend/plugins/storage_api/src/modules/storage/services/movementService.ts` | Idempotency, period-close handshake, close/reopen |
| Stock | `backend/plugins/storage_api/src/modules/storage/services/stockService.ts` | Receive, issue, box break, kit conversion |
| Work orders | `backend/plugins/storage_api/src/modules/storage/services/workOrderService.ts` | Completion-% close, line reopen |
| Tools | `backend/plugins/storage_api/src/modules/storage/services/toolService.ts` | Handover, repair, months in service |
| VAT | `backend/plugins/storage_api/src/modules/storage/services/vatService.ts` | Auto and manual reconciliation |
| Validation | `backend/plugins/storage_api/src/modules/storage/services/validation.ts` | Input checks, limits, ID generators |
| GraphQL | `backend/plugins/storage_api/src/apollo/` | `typeDefs.ts`, `resolvers/index.ts` |
| tRPC | `backend/plugins/storage_api/src/trpc/init-trpc.ts` | Placeholder `storage.hello` router |

## Contracts

### Provides

- GraphQL queries: `storageItems`, `storageRfidScan`, `storageWorkOrders`, `storageToolAssets`, `storageVatPayables`, `storageEBarimtReceipts`, `storagePeriodCloses`.
- GraphQL mutations: `storageItemCreate`, `storageReceiveStock`, `storageBreakSealedBox`, `storageIssueStock`, `storageWorkOrderClosePercent`, `storageWorkOrderReopenLine`, `storageToolInitiateHandover`, `storageToolAcceptHandover`, `storageToolSendToRepair`, `storageVatAutoReconcile`, `storageVatManualReconcile`, `storagePeriodClose`, `storagePeriodReopen`.
- Stock and cost mutations accept an optional `requestKey`; a retry with the same key returns the original result.
- Permission actions (module `storage`): `showStorageItems`, `manageStorageItems`, `showStorageWorkOrders`, `manageStorageWorkOrders`, `showStorageTools`, `manageStorageTools`, `manageStorageVat`, `manageStoragePeriodClose`.

### Consumes

- `erxes-api-shared/utils`: `startPlugin`, `createGenerateModels`, `apolloCommonTypes`, `apolloCustomScalars`, `ITRPCContext`.
- `erxes-api-shared/core-types`: `IMainContext` (`checkPermission`, `user`).

## Data and State

- Tenant-scoped collections: `storage_items`, `storage_rfid_tags`, `storage_tech_cards`, `storage_work_orders`, `storage_tool_assets`, `storage_vat_payables`, `storage_ebarimt_receipts`, `storage_period_closes`, `storage_stock_movements`.
- `storage_stock_movements` holds one record per mutation (`PENDING` → `POSTED` | `FAILED`) with a unique `requestKey`.
- `storage_period_closes` status flow: `CLOSING` → `CLOSED` | `ABORTED`; `CLOSED` → `REOPENED`.
- No migrations.

## Local Invariants

- Every stock or cost mutation goes through `runMovement`; never write stock counts outside it.
- Stock counts change only by compare-and-set on the values read (or `$inc` for receipts); never `find` + mutate + `save` on `storage_items`.
- A posting writes its `PENDING` movement before checking the period; a close writes `CLOSING` before checking for `PENDING` movements. Keep both orderings.
- A failing step undoes earlier writes of the same movement (tags, stock, cost line, tool assets by `movementId`).
- No MongoDB transactions are used (the dev database may be standalone). A crash mid-movement can leave a `PENDING` record that blocks period close until cleared.
- Inputs are validated in services with upper bounds from `LIMITS`; errors are `StorageInputError` with a Mongolian message.
- No imports from other plugins or `core-api`.

## Validation

- `pnpm nx build storage_api`
- `pnpm nx run storage_api:schema:print`
- Smoke: `pnpm dev:apis`, confirm the gateway logs that `storage` joined, then receive → break box → issue to an active work order → close % → reopen line; close a period and confirm an issue dated inside it fails.

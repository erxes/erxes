# `storage_api` Plugin Guide

## Identity

- **Plugin:** `storage`
- **Project:** `storage_api`
- **Layer:** Backend API
- **Path:** `backend/plugins/storage_api`
- **Last synchronized:** `2026-11-17`

## Scope

### Owns

- Warehouse zones: one zone has a sealed (RFID) location and an open location, each an inventory account + branch + department.
- RFID tag records (96-bit EPC, 24 hex characters) per sealed pack and their `SEALED` / `OPENED` status.
- RFID count sessions: reader EPC lists compared with registered sealed tags.
- Movements: the record that sealed packs were moved to the open location, and accounting's answer.

### Does not own

- Products, branches, departments and users (core).
- Stock quantities, cost, inventory transactions, period close, fixed assets and VAT (`accounting_api`). This plugin keeps no stock counts and never writes accounting collections.
- RFID reader hardware; EPC lists arrive through GraphQL.

## Current Capabilities

- Save and remove zones.
- Register tags for a product in a zone, either generated or from scanned EPCs.
- Break sealed boxes by EPC: tags become `OPENED` and one movement is created per request.
- Submit a reader scan for a zone and get matched, missing, unknown, opened and other-zone tags.
- List movements with their accounting status and re-send one to accounting.

## Architecture

| Area | Path | Responsibility |
| --- | --- | --- |
| Entry | `backend/plugins/storage_api/src/main.ts` | `startPlugin` config, context, tRPC router, permissions meta |
| Types | `backend/plugins/storage_api/src/modules/storage/@types/storage.ts` | Document interfaces |
| Models | `backend/plugins/storage_api/src/modules/storage/db/models/Storage.ts` | Schemas, `IModels`, `Movements.publishCreated` |
| Zones | `backend/plugins/storage_api/src/modules/storage/services/zoneService.ts` | Zone save, remove, lookup |
| Tags | `backend/plugins/storage_api/src/modules/storage/services/tagService.ts` | Tag registration and removal |
| Scan | `backend/plugins/storage_api/src/modules/storage/services/scanService.ts` | Count session comparison |
| Movements | `backend/plugins/storage_api/src/modules/storage/services/movementService.ts` | Box breaking, retry, accounting result |
| Validation | `backend/plugins/storage_api/src/modules/storage/services/validation.ts` | Input checks, limits, ID helpers |
| GraphQL | `backend/plugins/storage_api/src/apollo/` | `typeDefs.ts`, `resolvers/index.ts` |
| tRPC | `backend/plugins/storage_api/src/trpc/init-trpc.ts` | `movements.setAccountingResult` |

## Contracts

### Provides

- GraphQL queries: `storageZones`, `storageRfidTags`, `storageRfidSummary`, `storageMovements`, `storageScanSessions`.
- GraphQL mutations: `storageZoneSave`, `storageZoneRemove`, `storageRfidTagsRegister`, `storageRfidTagsRemove`, `storageBreakBoxes`, `storageRfidScanSubmit`, `storageMovementRetryAccounting`.
- Document event: a created `storage:storage.movements` document, published with `sendDbEventLog` from `Movements.publishCreated`. `accounting_api` consumes it in `meta/afterProcess.ts`.
- tRPC: `movements.setAccountingResult({ movementId, status, message })`, called by `accounting_api`.
- Permission actions (module `storage`): `showStorage`, `manageStorageTags`, `manageStorageMovements`, `manageStorageZones`.

### Consumes

- `erxes-api-shared/utils`: `startPlugin`, `createGenerateModels`, event handlers, `apolloCommonTypes`, `apolloCustomScalars`, `ITRPCContext`.
- `erxes-api-shared/core-types`: `IMainContext`.
- Federated `Product`, `Branch` and `Department` entities resolved by core through the gateway.

## Data and State

- Tenant-scoped collections: `storage_zones`, `storage_rfid_tags`, `storage_movements`, `storage_scan_sessions`.
- `storage_movements.requestKey` is unique; `accountingStatus` is `pending` → `success` | `error`.
- No migrations.

## Local Invariants

- Integration with other plugins goes through `meta` and events only: storage publishes the movement, accounting books it and answers by tRPC. No direct calls into `accounting_api` logic or collections.
- A movement is published only after all its tags were claimed (`SEALED` → `OPENED`); if the claim is partial, tags are restored and the movement is deleted.
- A retry with the same `requestKey` returns the first movement.
- Inputs are validated with upper bounds from `LIMITS`; errors are `StorageInputError`.
- No `any`.

## Validation

- `pnpm nx build storage_api`
- `pnpm nx run storage_api:schema:print`
- Smoke: `pnpm dev:apis` with `accounting_api` and the logs service enabled; create a zone, register tags, break a box, and confirm the movement turns `success` and an `invMove` transaction exists in accounting.

# storage_api

Isolated erxes v3 backend plugin for MMS Group warehouse, RFID, work orders, tool custody, VAT reconciliation, and period closing.

- Owns collections: `storage_items`, `storage_rfid_tags`, `storage_tech_cards`, `storage_work_orders`, `storage_tool_assets`, `storage_vat_payables`, `storage_ebarimt_receipts`, `storage_period_closes`.
- GraphQL prefix: `storage*` (unique federated subgraph operations).
- Boundaries: Do not import from other plugins or `core-api`; use `erxes-api-shared/utils` only.

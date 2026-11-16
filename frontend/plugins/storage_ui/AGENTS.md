# storage_ui

Isolated erxes v3 Module Federation remote UI plugin for MMS Group warehouse & project operations.

- Exposes `./config` and `./storage`.
- GraphQL operations: all prefixed with `storage*`.
- Boundaries: Only import UI primitives from `erxes-ui`, `ui-modules`, and `@apollo/client`; never import from `core-ui` or other plugins.

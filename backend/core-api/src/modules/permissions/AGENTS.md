# Permissions module (core-api)

## Architecture

- Groups define actions. `grants.ts` resolves active membership seats through
  position `groupIds` into entity boundaries; there are no direct user grants.
- Seat coverage `node` grants its node, `below` inherits through descendants,
  and `selected` grants the seat node and selected descendants individually.
  An inheriting root grant provides organization-wide access.

## Contracts

- `permissionGroupMembers` and `PermissionGroup.members` return position-seat
  holders. Groups referenced by positions cannot be removed.
- `permissions.resolveScope` resolves the acting user's checked actions into
  entity and user boundaries; `permissions.effectiveGrants` feeds action maps.
- `getUserStructureContext` supplies membership nodes and seat coverage.
  Import/export workers use `runAsPermissionScopeUser` for the requester.

## Invariants

- Boundaries never expand beyond seat coverage. Group scope is `self` or
  `entity`; legacy `own`, `group`, and `all` normalize to `entity`.
- Scope always includes the acting user; without matching grants it includes
  only their own and unassigned records. Only `structuresRead` additionally
  includes active membership nodes, never write actions.
- Positions, seats, holders, memberships, and tree changes invalidate the
  tenant permission cache.

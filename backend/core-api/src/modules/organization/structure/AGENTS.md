# Structure module (core-api)

## Architecture

- `db/definitions/structure.ts` and `db/models/` own tenant-scoped entity types,
  entities, memberships, positions, and seats. `StructureEntities.getRoot()`
  maintains one organization root; `order` stores the entity-id ancestry path.
- Positions are an organization-wide catalog of permission-group bundles.
  Seats bind a position to an entity; active memberships carry their holders.
- Capabilities are declared by entity type. Core owns location, contact, and
  schedule data; plugins own their capability data through federation.

## Contracts

- `graphql/schemas/structure.ts` exposes entity-type, entity, membership,
  position, and seat operations; `graphql/resolvers/legacy.ts` preserves the
  client-portal branch, department, and unit queries through `legacyKind`.
- `trpc/index.ts` provides structure lookups and user context, including
  membership nodes, seat coverage, and principal entity ids.
- Positions require `permissionsManage`; seats require
  `structureEntitiesManage` and the assignment checks in `access.ts`.

## Invariants

- Moves rewrite descendant paths. Archive ends memberships and requires no
  active children; memberships are ended, not deleted, preserving seat history.
- Seat coverage is `node`, `below`, or `selected`; selected coverage includes
  the seat node and only its strict descendants.
- Seat holders have an active membership at the seat node. Assignment requires
  the actor to hold every position group over the entire coverage; the owner
  bypasses that rule, but nobody changes their own seats.
- Integrity reads use `withoutPermissionScope`; visible entity and user reads
  remain permission-scoped. Permission-affecting changes invalidate tenant and
  affected-user permission caches.

# Files module (core-api)

Team file manager: large uploads straight to S3-compatible storage, folders,
trash, versions, previews, public links, and folder/file access control.
Frontend lives in `frontend/core-ui/src/modules/files` (page) and
`frontend/libs/ui-modules/src/modules/files` (shared upload engine, picker,
previews).

## Layout

| Path                                      | Responsibility                                                                                                    |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `db/definitions/*`                        | Schemas: files, folders, versions, uploads, usage, pins, shares                                                   |
| `db/models/Files.ts`                      | Upload sessions, versions, download URLs, list/search, move/trash/restore/purge, per-file access, previews, sweep |
| `db/models/FileFolders.ts`                | Spaces, legacy adoption, folder CRUD, access lists, access recompute                                              |
| `db/models/FilePins.ts` / `FileShares.ts` | Per-user pins (max 10), public links                                                                              |
| `utils/access.ts`                         | Actor (principals + admin), role math, read/manage filters, admin-access log                                      |
| `utils/sharePage.ts`                      | Public share landing / gone pages (self-contained HTML)                                                           |
| `graphql/`                                | `files*` queries and mutations; resolvers only build the actor and call models                                    |
| `routes.ts`                               | `GET /files/s/:token` public link                                                                                 |
| `worker/`                                 | `core` queue `files`: `preview`, `access` (big subtree recompute), hourly `sweep`                                 |

## Access model (enforced in models, never in resolvers)

- Roles: `viewer` < `contributor` (upload, new folders) < `manager` (rename,
  move, trash, share links, change access). Highest role across grants wins.
- Principals: `user:<id>`, `department:<id>`, `branch:<id>`, `unit:<id>`,
  `everyone`. A department/branch grant covers its sub-tree: a user's
  principals include all ancestors of their own (cached in Redis
  `files:principals:<subdomain>:<userId>`, TTL 60s).
- Folders own an `access` list, optional `restricted` (stop inheriting), and
  denormalized `readers` / `contributors` / `managers` keys. Files own extra
  grants (`viewer` | `manager` only) that add to their folder's; they carry
  `readers` / `managers`.
- Spaces are real root folders: `rootKey: 'org'` (everyone viewer, no owner)
  and `rootKey: 'user:<id>'` (My files, restricted, cannot be shared).
- The creator of a folder or file is its owner: their manager grant is re-added
  on every access save.
- `filesRead` permission = may use Files. `filesAdmin` = read-only oversight
  (see and download everything, logged as `filesAdminAccess`), with one
  exception: admins are manager of the ownerless Org drive root, so they can
  create its top-level folders and grant others access to it. Nothing below the
  root gets write rights from admin. Default groups grant only `filesRead`;
  `filesAdmin` is given explicitly.

## Invariants

- No access = invisible: reads filter by `readers` (`readFilter`), a missing
  role surfaces as NOT_FOUND, never FORBIDDEN.
- Any change to an access list, a move or a restore-with-move must call
  `FileFolders.refreshAccess` (sync up to 200 descendants, else worker).
- Files' `readers` / `managers` are always folder ∪ own grants
  (`fileAccessFields` / `fileAccessPipeline`); never write them directly.
- Batch operations check every item before changing any.
- Bytes never pass through this service: uploads and downloads are presigned.
- Production MongoDB is 4.4: no 5.0+ operators in queries or pipelines.
- Product `files` hold public share URLs (`/files/s/:token`), not file ids:
  POS and websites read them without login. Revoking the link or purging the
  file breaks them there; replacing a version does not.
- "Shared with me" queries exclude the actor's own items in Mongo, before the
  500-row limit; every owned item carries a `user:<id>` grant.
- Image thumbnails read width/height from the header first
  (`utils/imageSize.ts`) and skip anything over `FILES_THUMBNAIL_MAX_PIXELS`:
  Jimp allocates the full bitmap inside the API process.
- The public share route answers 404 only for `ExpectedError` (gone link);
  other failures are logged and get a 503 "try again" page.

## Validation

- `NODE_OPTIONS=--max-old-space-size=8192 pnpm nx build core-api`
- `npx eslint backend/core-api/src/modules/files`
- `pnpm nx test core-api` — `utils/__tests__/` covers access rules (grants,
  role merge, `assertRole` NOT_FOUND/FORBIDDEN, admin read-only except the Org
  root), image header sizes, and the share pages (escaping, mn/en); Redis,
  queue and `canGroup` are mocked.
- Smoke: an "Only me" folder is invisible to a second user; a department
  share shows under that user's Shared with me; a viewer cannot open Share.

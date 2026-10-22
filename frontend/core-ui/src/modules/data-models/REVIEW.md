# Data Models review

Reviewed 2026-10-23 against the working implementation, including its backend
metadata/runtime, generated documents, settings, record editors and relation UI.

## Corrected findings

- **Built-in conflicts could discard entries and show success.** Apollo's
  mutation callback can return no successful data after an error. The built-in
  editor now checks the result before refetching, showing success or closing.
- **Background field refreshes could unmount record editors.** Initial loading
  and refresh loading are now distinct. Loaded fields remain mounted, and
  refresh failures have a separate retry surface. Custom record editors retain
  their opening metadata and expected version.
- **A committed write could look like a failed save.** Write selections now
  request only identity/version, avoiding relation resolution after a write.
  Follow-up query failures expose their own error state without changing the
  mutation's successful result, preventing accidental retries of committed work.
- **Relations were mostly raw, non-navigable IDs.** Names/images resolve through
  the authorized relation-options API. Linked names open the existing record
  navigator, with custom-record views, normal contact views and product/user
  reference views. Back navigation and reloadable panel URLs are retained.
- **Selections outside the first picker page lost their labels.** A bounded
  exact-ID lookup resolves existing selections independently of search/paging.
  Missing/deleted targets are not offered as clickable records.
- **Reverse links were silently limited to the first 25 records.** Detail views
  now page reverse links. Built-in reverse queries exclude missing/deleted
  business records before pagination, not after it.
- **Creation asked users to invent unfamiliar configuration.** Object-name and
  field presets, ready-made choice sets, an expandable visual type chooser and
  destination-first relation setup provide guided starting points. Technical
  identities remain generated under More settings. Presets create real editable
  configuration; they do not silently provision additional objects/records.
- **Dirty modal entries could be dismissed accidentally.** Object, field and
  record editors now require explicit discard confirmation. This protects sheet
  dismissal; it is not a claim of application-wide route blocking or draft storage.
- **Tab/view changes erased reference URLs.** Only the owned tab/view parameter
  is changed; unrelated URL state such as `panel` is preserved.

## Confirmed existing safeguards

The backend tests cover tenant-local storage, field identity and enum validation,
protected built-ins, action permissions, record compare-and-swap versions,
required values including false/zero, relation cardinality, target existence,
read-only reverse inputs, and soft-delete/restore. These are automated checks,
not proof that every possible failure is handled.

## Remaining risks

1. **Relation metadata lifecycle is not atomic across documents.**
   `backend/core-api/src/modules/data-models/fields/registry.ts` updates forward
   groups and inverse fields in separate writes. `saveMorph` checks matched
   counts only after `updateMany`, and `setArchived` updates the inverse after
   the forward save. An interrupted operation or racing writer can leave
   inconsistent versions/statuses. Creation has rollback, but a process/database
   failure can also defeat compensation. This review does not introduce database
   transactions, a replica-set requirement, or a reconciliation job. Production
   hardening needs an explicit supported atomic/recovery strategy.
2. **Catalog search is page-local.** The UI and its accessible search label say
   so; pagination remains available. Workspace-wide search needs a server-side
   catalog search contract, not a misleading client-only filter.
3. **Not every business screen consumes all additional built-in fields.**
   Existing customer list/detail integration remains in place. Product/user
   reference panels select their additional fields through normal business roots;
   this is not a rewrite of every product, company or team-management screen.
4. **No per-record ACLs, file fields or one-to-one uniqueness.** These remain
   existing capability boundaries, not options silently promised by the new UI.

## Validation

- Core API and core UI production builds.
- Focused Data Models API/UI tests, including new reference, pagination,
  background-refresh, committed-write/refetch, discard and conflict regressions.
- Full core API and core UI suites; existing UI failures in notifications,
  agent approvals and MainLayout are outside this module.
- Module ESLint and project TypeScript checks. Project-wide checks still expose
  existing failures outside Data Models; they are not reported as clean.
- Isolated MongoDB/browser smoke with a mocked sign-in session, using real
  metadata/runtime/schema code. Temporary records/databases are removed. This
  does not substitute for a production-authentication or gateway deployment test.

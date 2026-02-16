# Bug Fix Tracking Document

## How to Use This Document

This document tracks all bugs identified by the Agent Swarm and their corresponding fixes. Each bug has:
- **ID**: Unique identifier
- **File**: Location of the bug
- **Issue**: Description of the problem
- **Fix Applied**: How it was fixed
- **Status**: pending | in_progress | done
- **Test Added**: Whether tests were added

---

## 🔴 CRITICAL BUGS

### CRIT-001: XSS in SendEmailActionResult
- **File:** `frontend/core-ui/src/modules/automations/components/builder/nodes/actions/sendEmail/components/SendEmailActionResult.tsx:69`
- **Issue:** dangerouslySetInnerHTML without sanitization
- **Fix Applied:** Add DOMPurify.sanitize()
- **Status:** pending
- **Test Added:** No

### CRIT-002: XSS in FacebookPostTrigger
- **File:** `frontend/plugins/frontline_ui/src/modules/integrations/facebook/components/FacebookPostTrigger.tsx:30`
- **Issue:** dangerouslySetInnerHTML without sanitization
- **Fix Applied:** Add DOMPurify.sanitize()
- **Status:** pending
- **Test Added:** No

### CRIT-003: Permission System Disabled
- **File:** `backend/erxes-api-shared/src/core-modules/permissions/utils.ts:73-117`
- **Issue:** All permission checks commented out
- **Fix Applied:** Uncomment permission checking logic
- **Status:** pending
- **Test Added:** No

### CRIT-004: JWT Silent Failures in Gateway
- **File:** `backend/gateway/src/middlewares/userMiddleware.ts:151-155`
- **Issue:** JWT errors caught but request continues
- **Fix Applied:** Return 401 instead of next()
- **Status:** pending
- **Test Added:** No

### CRIT-005: Unauthenticated File Uploads
- **File:** `backend/core-api/src/routes/fileRoutes.ts:98-157`
- **Issue:** No auth on /upload-file endpoint
- **Fix Applied:** Add authentication middleware
- **Status:** pending
- **Test Added:** No

### CRIT-006: z.any() in tRPC Procedures
- **File:** Multiple tRPC router files
- **Issue:** No input validation on most endpoints
- **Fix Applied:** Replace z.any() with proper schemas
- **Status:** pending
- **Test Added:** No

### CRIT-007: Security Middleware Disabled
- **File:** `backend/erxes-api-shared/src/utils/trpc/trpc-setup.ts`
- **Issue:** Rate limiting, HMAC verification commented out
- **Fix Applied:** Uncomment and configure security middleware
- **Status:** pending
- **Test Added:** No

### CRIT-008: Date.now() as Schema Default
- **File:** 20+ definition files
- **Issue:** new Date() evaluates at schema load time
- **Fix Applied:** Change to Date.now (without parentheses)
- **Status:** pending
- **Test Added:** No

### CRIT-009: Non-Idempotent Migrations
- **File:** `backend/core-api/src/commands/migrateProperties.ts:186-220`
- **Issue:** insertOne without existence check
- **Fix Applied:** Use upsert or track migration state
- **Status:** pending
- **Test Added:** No

### CRIT-010: Missing Permission Checks - Products
- **File:** `backend/core-api/src/modules/products/graphql/resolvers/mutations/*.ts`
- **Issue:** No checkPermission calls
- **Fix Applied:** Add checkPermission to all mutations
- **Status:** pending
- **Test Added:** No

### CRIT-011: Missing Permission Checks - Broadcast
- **File:** `backend/core-api/src/modules/broadcast/graphql/resolvers/mutations/*.ts`
- **Issue:** No checkPermission calls
- **Fix Applied:** Add checkPermission to all mutations
- **Status:** pending
- **Test Added:** No

### CRIT-012: this.models Undefined
- **File:** `backend/core-api/src/modules/automations/graphql/resolvers/queries.ts:382-399`
- **Issue:** Uses this.models which doesn't exist
- **Fix Applied:** Use models from context parameter
- **Status:** pending
- **Test Added:** No

### CRIT-013: Duplicate Worker Message
- **File:** `backend/core-api/src/modules/automations/graphql/resolvers/mutations.ts:113-128`
- **Issue:** Same message sent twice
- **Fix Applied:** Remove duplicate sendWorkerMessage call
- **Status:** pending
- **Test Added:** No

### CRIT-014: Regex Injection in Forms
- **File:** `backend/core-api/src/modules/forms/db/models/Forms.ts:265-275`
- **Issue:** new RegExp from user input without try-catch
- **Fix Applied:** Wrap in try-catch with error handling
- **Status:** pending
- **Test Added:** No

### CRIT-015: Missing Transactions in User Import
- **File:** `backend/core-api/src/modules/organization/team-member/meta/import-export/import/processUserRows.ts:89-114`
- **Issue:** Multi-step operation not atomic
- **Fix Applied:** Use MongoDB transactions
- **Status:** pending
- **Test Added:** No

### CRIT-016: No Timeout on External APIs
- **File:** `backend/core-api/src/modules/clientportal/services/notification/notificationService.ts:100-115`
- **Issue:** Fetch without timeout can block
- **Fix Applied:** Add AbortSignal.timeout(30000)
- **Status:** pending
- **Test Added:** No

### CRIT-017: LocalStorage Without Error Handling
- **File:** `frontend/core-ui/src/i18n/config.ts:27-35`
- **Issue:** Crashes in Safari private mode
- **Fix Applied:** Add try-catch blocks
- **Status:** pending
- **Test Added:** No

### CRIT-018: Broken Plugin References
- **File:** `backend/plugins/insurance_api/definitions/*.ts`
- **Issue:** References non-existent collections
- **Fix Applied:** Use centralized reference registry
- **Status:** pending
- **Test Added:** No

### CRIT-019: Race Condition in Duplicate Check
- **File:** `backend/core-api/src/modules/contacts/db/models/Customers.ts:907-967`
- **Issue:** Find-then-insert pattern
- **Fix Applied:** Use unique indexes with transactions
- **Status:** pending
- **Test Added:** No

### CRIT-020: Raw Errors to Client
- **File:** `backend/core-api/src/modules/broadcast/graphql/resolvers/queries/engage.ts:269-278`
- **Issue:** Returns raw error object
- **Fix Applied:** Return sanitized error messages
- **Status:** pending
- **Test Added:** No

### CRIT-021: Migrations Without Rollback
- **File:** `backend/plugins/content_api/src/modules/cms/migrations/add-type-to-translations.ts`
- **Issue:** No down() function
- **Fix Applied:** Add rollback function
- **Status:** pending
- **Test Added:** No

### CRIT-022: setTimeout Without Cleanup
- **File:** `frontend/core-ui/src/modules/notification/components/NotificationItem.tsx:22-29`
- **Issue:** Memory leak in useEffect
- **Fix Applied:** Clear timeout in cleanup function
- **Status:** pending
- **Test Added:** No

---

## 🟠 HIGH SEVERITY BUGS (Selected)

### HIGH-001: Array Index as Key
- **File:** 20+ frontend files
- **Issue:** Using index as React key causes rendering issues
- **Fix Applied:** Use unique identifiers instead
- **Status:** pending
- **Test Added:** No

### HIGH-002: N+1 Query - Product Count By Tags
- **File:** `backend/core-api/src/modules/products/graphql/resolvers/queries/product.ts:403-416`
- **Issue:** Individual count queries in loop
- **Fix Applied:** Use aggregation pipeline
- **Status:** pending
- **Test Added:** No

### HIGH-003: Missing Index on primaryEmail
- **File:** `backend/core-api/src/modules/contacts/db/definitions/customers.ts:78-83`
- **Issue:** No index on frequently queried field
- **Fix Applied:** Add index: true
- **Status:** pending
- **Test Added:** No

### HIGH-004: No Pagination Limits
- **File:** `backend/core-api/src/modules/contacts/trpc/customer.ts:16`
- **Issue:** Can return unlimited results
- **Fix Applied:** Add limit parameter with max
- **Status:** pending
- **Test Added:** No

### HIGH-005: Typo - userMovemment
- **File:** `backend/erxes-api-shared/src/core-modules/users/db/definitions/users.ts:206`
- **Issue:** Double 'm' in Movement
- **Fix Applied:** Rename to userMovement
- **Status:** pending
- **Test Added:** No

---

## 📊 Fix Statistics

| Priority | Total | Pending | In Progress | Done |
|----------|-------|---------|-------------|------|
| Critical | 22 | 22 | 0 | 0 |
| High | 100 | 100 | 0 | 0 |
| Medium | 166 | 166 | 0 | 0 |
| Low | 90 | 90 | 0 | 0 |
| **TOTAL** | **378** | **378** | **0** | **0** |

---

## 🎯 Sprint Planning

### Sprint 1: Security (Week 1)
- [ ] CRIT-001: XSS in SendEmailActionResult
- [ ] CRIT-002: XSS in FacebookPostTrigger
- [ ] CRIT-003: Permission System
- [ ] CRIT-004: JWT Silent Failures
- [ ] CRIT-005: Unauthenticated Uploads
- [ ] CRIT-006: z.any() in tRPC
- [ ] CRIT-007: Security Middleware
- [ ] CRIT-014: Regex Injection

### Sprint 2: Data Integrity (Week 2)
- [ ] CRIT-008: Date.now() Defaults
- [ ] CRIT-009: Non-Idempotent Migrations
- [ ] CRIT-015: Missing Transactions
- [ ] CRIT-019: Race Condition
- [ ] CRIT-021: Migration Rollbacks
- [ ] HIGH-003: Missing Indexes

### Sprint 3: Performance (Week 3)
- [ ] HIGH-002: N+1 Queries
- [ ] HIGH-004: Pagination Limits
- [ ] HIGH-001: Array Index Keys
- [ ] CRIT-016: API Timeouts

### Sprint 4: Code Quality (Week 4)
- [ ] CRIT-022: Memory Leaks
- [ ] CRIT-020: Raw Errors
- [ ] CRIT-017: LocalStorage Errors
- [ ] HIGH-005: Typos

---

## 🔍 Testing Checklist

For each fix, ensure:
- [ ] Unit test added
- [ ] Integration test added
- [ ] Security test added (if applicable)
- [ ] Performance test added (if applicable)
- [ ] Backwards compatibility verified
- [ ] Documentation updated

---

*Last Updated: 2026-02-17*

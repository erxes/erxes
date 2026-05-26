# Insurance Module

**Backend root:** `backend/plugins/insurance_api/src/modules/`
**Frontend root:** `frontend/plugins/insurance_ui/src/`

## Entities

### Contract
An active insurance policy.
- **Files:** `db/models/contract.ts`, `db/models/contractTemplates.ts`
- **Fields:** `policyNumber`, `startDate`, `endDate`, `premiumAmount`

### Vendor & Product
The insurance carrier and the specific policy types they offer.
- **Files:** `db/models/vendor.ts`, `db/models/product.ts`

### Risk & Types
Categorizations of risk and coverage.
- **Files:** `db/models/riskType.ts`, `db/models/insuranceType.ts`

## Mechanics
Extends the CRM to track policy lifecycles, renewals, and carrier payouts. When a Deal is won in Sales, it can automatically generate an Insurance Contract.

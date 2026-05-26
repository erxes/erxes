# Loyalty plugin

**Backend:** `backend/plugins/loyalty_api/`
**Frontend:** `frontend/plugins/loyalty_ui/`

Customer retention features including point scoring, vouchers, coupons, spin-the-wheel, donations, and lotteries.

## Modules

| Module | Doc | Backend root | Frontend root |
|---|---|---|---|
| **loyalty** | [modules/loyalty.md](modules/loyalty.md) | `backend/plugins/loyalty_api/src/modules/` | `frontend/plugins/loyalty_ui/src/` |

## Integration with other plugins
- **Core:** Connects `ScoreLog` and `Voucher` to `Customer` and `Company`.
- **Sales (POS):** Applies coupons or vouchers at checkout, calculates point accumulation from total spend.
- **Ecommerce:** Same as POS (earn/burn points, use coupons).

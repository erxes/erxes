# Loyalty Modules

**Backend root:** `backend/plugins/loyalty_api/src/modules/`
**Frontend root:** `frontend/plugins/loyalty_ui/src/`

The loyalty plugin is divided into several sub-modules representing different retention mechanics.

## Core Mechanics

### Score (Points)
Point accumulation and deduction.
- **Entities:** `ScoreCampaign`, `ScoreLog`
- **Mechanics:** Tracks points earned by customers. Used heavily by POS/Ecommerce.

### Coupon & Voucher
Discount codes and prepaid credits.
- **Entities:** `CouponCampaign`, `Coupon`, `VoucherCampaign`, `Voucher`
- **Mechanics:** 
  - Coupons apply percentage or fixed discounts.
  - Vouchers act like gift cards (cash value).

### Gamification & Events
- **Spin Wheel:** `SpinCampaign`, `Spin` (random reward generation).
- **Lottery:** `LotteryCampaign`, `Lottery` (raffle ticket generation).

### Other
- **Donate:** `DonateCampaign`, `Donate` (allows customers to convert points to donations or make direct donations).
- **Pricing:** `PricingPlan` (dynamic pricing rules, e.g. "Buy 1 Get 1 Free" or expiry logic).

## Cross-plugin Interactions
When a POS order is finalized in `sales_api` or `posclient_api`, it triggers a call to `loyalty_api` (usually via tRPC or message broker) to:
1. Validate and consume any used coupons/vouchers.
2. Calculate and award `ScoreLog` points based on the customer's purchase amount and active `ScoreCampaign` rules.

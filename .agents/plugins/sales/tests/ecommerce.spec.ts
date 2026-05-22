/**
 * Eval files (verify these after changes — re-run this spec):
 *   backend/plugins/sales_api/src/modules/ecommerce/routes.ts
 *   backend/plugins/sales_api/src/modules/ecommerce/db/models/Wishlist.ts
 *   backend/plugins/sales_api/src/modules/ecommerce/db/models/ProductReview.ts
 *   backend/plugins/sales_api/src/modules/ecommerce/db/models/Address.ts
 *   backend/plugins/sales_api/src/modules/ecommerce/db/models/LastViewedItems.ts
 *   backend/plugins/sales_api/src/modules/ecommerce/graphql/typeDefs.ts
 *   backend/plugins/sales_api/src/modules/ecommerce/utils.ts
 *
 * Module doc: ../modules/ecommerce.md
 *
 * Test plan: ecommerce surfaces are REST-only on the sales plugin and are
 * routed through the gateway as `/pl:sales/ecommerce-*`. This spec exercises
 * the input-validation contract of those endpoints (every read endpoint
 * 400s when `customerId` or `productId` is missing, bulk-operations 400s
 * without an `operations` array) using Playwright's `request` fixture against
 * the gateway. Endpoints requiring an authenticated customer cookie are
 * skipped explicitly.
 */
import { test, expect } from '@playwright/test';

const API_URL = process.env.AGENT_TEST_API_URL ?? 'http://localhost:4000';
// Gateway routes plugin REST as /pl:<service>/<path>
// — see backend/gateway/src/main.ts:172-207.
const BASE = `${API_URL}/pl:sales`;

test.describe('sales > ecommerce (REST surface via gateway)', () => {
  test('GET /ecommerce-init without customerId returns 400', async ({
    request,
  }) => {
    // backend/plugins/sales_api/src/modules/ecommerce/routes.ts:234-236
    const res = await request.get(`${BASE}/ecommerce-init`);
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body).toMatchObject({ error: 'Customer ID is required' });
  });

  test('GET /ecommerce-product-summary without productId returns 400', async ({
    request,
  }) => {
    // routes.ts:260-262
    const res = await request.get(`${BASE}/ecommerce-product-summary`);
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body).toMatchObject({ error: 'Product ID is required' });
  });

  test('GET /ecommerce-last-viewed without customerId returns 400', async ({
    request,
  }) => {
    // routes.ts:286-288
    const res = await request.get(`${BASE}/ecommerce-last-viewed`);
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body).toMatchObject({ error: 'Customer ID is required' });
  });

  test('GET /ecommerce-wishlist without customerId returns 400', async ({
    request,
  }) => {
    // routes.ts:332-334
    const res = await request.get(`${BASE}/ecommerce-wishlist`);
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body).toMatchObject({ error: 'Customer ID is required' });
  });

  test('GET /ecommerce-addresses without customerId returns 400', async ({
    request,
  }) => {
    // routes.ts:374-376
    const res = await request.get(`${BASE}/ecommerce-addresses`);
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body).toMatchObject({ error: 'Customer ID is required' });
  });

  test('GET /ecommerce-product-reviews without productId returns 400', async ({
    request,
  }) => {
    // routes.ts:401-403
    const res = await request.get(`${BASE}/ecommerce-product-reviews`);
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body).toMatchObject({ error: 'Product ID is required' });
  });

  test('POST /ecommerce-bulk-operations without operations array returns 400', async ({
    request,
  }) => {
    // routes.ts:460-463 — requires `operations: Array`.
    const res = await request.post(`${BASE}/ecommerce-bulk-operations`, {
      data: {},
    });
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body).toMatchObject({ error: 'Operations array is required' });
  });

  test('GET /ecommerce-wishlist with a known customerId returns wishlist payload', async ({
    request,
  }) => {
    // routes.ts:325-364 — successful path returns { status: 'success', data: [...] }.
    // Skipped: no seeded customer fixture, and the gateway typically forwards
    // a subdomain header that we cannot reliably set here.
    test.skip(
      true,
      'requires a seeded customer + multi-tenant subdomain header',
    );
    const res = await request.get(
      `${BASE}/ecommerce-wishlist?customerId=_seeded_customer_id_`,
    );
    expect(res.status()).toBe(200);
  });
});

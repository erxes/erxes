import { AxeBuilder } from '@axe-core/playwright';
import { CORE_API_PREFIX, coreContract } from '@erxes/core-contract';
import { createORPCClient } from '@orpc/client';
import type { ContractRouterClient } from '@orpc/contract';
import { OpenAPILink } from '@orpc/openapi-client/fetch';
import { test as base, expect, type APIRequestContext, type Page } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';

/** Synthetic owner the setup project creates on the fresh database. */
export const OWNER = {
  organizationName: 'E2E Org',
  firstName: 'Olivia',
  lastName: 'Owner',
  email: 'owner@e2e.test',
  password: 'E2e-owner-pass-1',
};

export const OWNER_STATE = resolve(import.meta.dirname, 'test-results/.auth/owner.json');

/** A suffix that keeps records from parallel tests (and reruns) apart. */
export const unique = () => randomBytes(3).toString('hex');

/**
 * The typed contract client over Playwright's request context, so seeding shares the
 * page's session cookie. Writes carry the header browsers send, which core's CSRF check reads.
 */
export const coreClient = (request: APIRequestContext, baseURL: string | undefined) => {
  const client: ContractRouterClient<typeof coreContract> = createORPCClient(
    new OpenAPILink(coreContract, {
      url: `${baseURL ?? ''}${CORE_API_PREFIX}`,
      fetch: async (call) => {
        const response = await request.fetch(call.url, {
          method: call.method,
          headers: { ...Object.fromEntries(call.headers), 'sec-fetch-site': 'same-origin' },
          data: call.body ? Buffer.from(await call.arrayBuffer()) : undefined,
        });

        // A 204 must have no body at all, not an empty one.
        const body = await response.text();

        return new Response(body || null, {
          status: response.status(),
          headers: response.headers(),
        });
      },
    }),
  );

  return client;
};

/**
 * Fails on serious or critical axe violations on the page as it is now, listing
 * each rule with the elements that break it.
 */
export const expectAccessible = async (page: Page) => {
  // Colours are checked at rest, not halfway through a fade or slide. Spinners and
  // pulses loop forever, so only animations that end are waited for.
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every(
        (animation) =>
          animation.playState !== 'running' ||
          animation.effect?.getTiming().iterations === Infinity,
      ),
  );

  const { violations } = await new AxeBuilder({ page }).analyze();

  const blocking = violations
    .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
    .map(
      (violation) =>
        `${violation.id} (${violation.impact}): ${violation.help}\n${violation.nodes
          .map(
            (node) =>
              `  ${node.target.join(' ')}\n    ${node.html.slice(0, 200)}\n    ${node.failureSummary ?? ''}`,
          )
          .join('\n')}`,
    );

  expect(blocking, `axe on ${page.url()}`).toEqual([]);
};

export const test = base.extend<{ api: ReturnType<typeof coreClient> }>({
  api: async ({ page, baseURL }, use) => {
    await use(coreClient(page.request, baseURL));
  },
});

export { expect };

import type { IntegrationScope } from '@erxes/core-contract';
import { caller, integrationConnections } from '@erxes/core-db';
import type { Listing } from '@erxes/plugin-sdk/integrations';
import { and, eq, isNull, or, type SQL, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { manages } from './connectable';
import { keyedOf } from './registry';

const ORG_ONLY: readonly IntegrationScope[] = ['org'];

export const scopesOf = (integration: Listing) => integration.scopes ?? ORG_ONLY;

export const allowsPersonal = (integration: Listing) => scopesOf(integration).includes('personal');

const ownerColumn = integrationConnections.ownerId;

const own = (userId: string) => eq(ownerColumn, userId);

/**
 * The connections the caller reaches: core's own work all of them, a member the organisation's
 * and their own, a plugin or a customer only the organisation's.
 */
const reachable = (): SQL | undefined => (caller().type === 'system' ? undefined : pickable());

/** Orders the member's own connections before the organisation's. */
export const ownFirst = sql`${ownerColumn} is null`;

/** `where` on the connections the caller reaches. */
export const withinReach = (where?: SQL) => and(reachable(), where);

/**
 * The connections a pick by integration may land on: a member's own and the organisation's;
 * for anyone else, core's own work included, only the organisation's.
 */
export const pickable = (): SQL | undefined => {
  const who = caller();

  return who.type === 'user' ? or(isNull(ownerColumn), own(who.userId)) : isNull(ownerColumn);
};

/**
 * The integration's connections the caller may use: a member their own, and the organisation's
 * while their role manages it; anyone else only the organisation's.
 */
export const usable = (integration: Listing): SQL | undefined => {
  const who = caller();

  if (who.type !== 'user') return isNull(ownerColumn);

  return manages(integration) ? pickable() : own(who.userId);
};

/** The owner a new connection gets: the member for a personal one, none for the organisation's. */
export const ownerFor = (integration: Listing, scope: IntegrationScope) => {
  if (!scopesOf(integration).includes(scope)) {
    throw fail(
      'NOT_ALLOWED',
      scope === 'personal'
        ? `${integration.name} connects for the whole organisation only`
        : `${integration.name} connects for one member only`,
    );
  }

  if (scope === 'personal') return caller('user').userId;

  if (!manages(integration)) {
    throw fail('NOT_ALLOWED', "Your role doesn't allow this", {
      permission: integration.permission,
    });
  }

  return null;
};

/** The caller sees it in Settings: their role manages it, or a member may connect their own. */
export const listed = (integration: Listing) => manages(integration) || allowsPersonal(integration);

export const listable = (key: string) => {
  const integration = keyedOf(key);

  if (!listed(integration)) {
    throw fail('NOT_ALLOWED', "Your role doesn't allow this", {
      permission: integration.permission,
    });
  }

  return integration;
};

/** Refuses a change to a connection that is neither the member's own nor one their role manages. */
export const ensureEditable = (integration: Listing, row: { ownerId: string | null }) => {
  if (row.ownerId === null ? manages(integration) : row.ownerId === caller('user').userId) return;

  throw fail('NOT_ALLOWED', "Your role doesn't allow this", { permission: integration.permission });
};

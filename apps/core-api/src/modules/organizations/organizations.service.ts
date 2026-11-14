import { seedLeadStages } from '~/modules/leads/leadStages.service';
import type { Db } from '@erxes/core-db';
import { newId, organizations, users, withSystem } from '@erxes/core-db';
import { currencyOfCountry } from '@erxes/core-contract';
import { sql } from 'drizzle-orm';
import { HttpError, notFound, pgCode } from '~/http/errors';
import { diffRows } from '~/lib/changes';
import { oneRow } from '~/lib/rows';
import { installPluginsForNewOrganization } from '~/modules/plugins/plugins.service';
import { seedRoles } from '~/modules/roles/roles.service';

const SUBDOMAIN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

interface Region {
  country?: string;
  currency?: string;
}

/** The currency to keep: the one asked for, else the new country's, else the current one. */
const currencyFor = (input: Region, current: { country: string | null; currency: string }) =>
  input.currency ??
  (input.country && input.country !== current.country ? currencyOfCountry(input.country) : null) ??
  current.currency;

/** The scope's organisation (`withOrg`). */
export const getOrganization = async (client: Db) => {
  const [row] = await client.select().from(organizations).limit(1);

  if (!row) {
    throw notFound('Organization');
  }

  return row;
};

interface NewOrganization extends Region {
  /** Given by the SaaS control plane; new otherwise. */
  id?: string;
  subdomain: string;
  name: string;
  owner: { email: string; fullName?: string; passwordHash?: string };
}

/** Creates an organisation with its first owner (active) inside `tx`. */
export const insertOrganization = async (tx: Db, input: NewOrganization) => {
  const subdomain = input.subdomain.trim().toLowerCase();

  if (!SUBDOMAIN.test(subdomain)) {
    throw new HttpError(400, 'INVALID_SUBDOMAIN', 'Use letters, digits and dashes (1–63)');
  }

  const organization = oneRow(
    await tx
      .insert(organizations)
      .values({
        id: input.id ?? newId(),
        subdomain,
        name: input.name.trim(),
        country: input.country ?? null,
        currency: currencyFor(input, { country: null, currency: 'USD' }),
      })
      .returning(),
  );

  await seedRoles(tx, organization.id);
  await seedLeadStages(tx, organization.id);

  const owner = oneRow(
    await tx
      .insert(users)
      .values({
        id: newId(),
        orgId: organization.id,
        email: input.owner.email.trim().toLowerCase(),
        fullName: input.owner.fullName?.trim() || null,
        passwordHash: input.owner.passwordHash ?? null,
        role: 'owner',
        status: 'active',
      })
      .returning(),
  );

  await installPluginsForNewOrganization(tx, organization.id);

  return { organization, owner };
};

/** Creates an organisation with its first owner (bootstrap script, setup, tests). */
export const createOrganization = async (input: NewOrganization) => {
  try {
    return await withSystem('create organization', (tx) => insertOrganization(tx, input));
  } catch (error) {
    if (pgCode(error) === '23505') {
      throw new HttpError(409, 'SUBDOMAIN_TAKEN', 'This subdomain is already used');
    }

    throw error;
  }
};

/**
 * Renames the organisation or changes where it works. A new country without
 * a currency also takes that country's currency; products and invoices keep
 * the currency they were made in.
 */
export const updateOrganization = async (tx: Db, input: Region & { name?: string }) => {
  const before = await getOrganization(tx);

  const row = oneRow(
    await tx
      .update(organizations)
      .set({
        name: input.name ?? before.name,
        country: input.country ?? before.country,
        currency: currencyFor(input, before),
        updatedAt: sql`now()`,
      })
      .returning(),
  );

  return { organization: row, changes: diffRows(before, row, ['settings']) };
};

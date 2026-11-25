import {
  caller,
  type Db,
  integrationConnections,
  newId,
  requestOrgId,
  withOrg,
} from '@erxes/core-db';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { randomToken } from '~/lib/crypto';
import {
  type GithubInstallation,
  githubApp,
  installationToken,
  installUrl,
  openTicket,
  sealTicket,
  signInUrl,
} from './githubApp';
import { insertConnection } from './integrations.service';
import { sealState } from './oauth';
import { keyedOf } from './registry';
import { ownerFor } from './scopes';
import { freeName } from './signIns';

const STATE_MINUTES = 10;

/** The GitHub integration, refused unless the member may connect it for the organisation. */
const forOrganisation = () => {
  const integration = keyedOf('github');

  ownerFor(integration, 'org');
  githubApp();

  return integration;
};

const newState = () =>
  sealState({
    orgId: requestOrgId(),
    userId: caller('user').userId,
    key: 'github',
    scope: 'org',
    nonce: randomToken(24),
    expiresAt: Date.now() + STATE_MINUTES * 60_000,
  });

export const githubSignIn = () => {
  forOrganisation();

  return { url: signInUrl(newState()) };
};

/** What Settings gets back: the installations the member manages, and where to install more. */
export const ticketFor = (installations: GithubInstallation[]) =>
  sealTicket({
    orgId: requestOrgId(),
    userId: caller('user').userId,
    installations,
    installUrl: installUrl(newState()),
  });

const installationColumn = sql`(${integrationConnections.settings} ->> 'installationId')::bigint`;

const connectionOfInstallation = async (tx: Db, installationId: number) => {
  const [row] = await tx
    .select()
    .from(integrationConnections)
    .where(
      and(
        eq(integrationConnections.key, 'github'),
        eq(integrationConnections.auth, 'app'),
        isNull(integrationConnections.ownerId),
        eq(installationColumn, installationId),
      ),
    )
    .limit(1);

  return row ?? null;
};

/**
 * The organisation's connection for an installation the member proved they manage: a new one
 * named after the GitHub account, or the one it has, turned on again. Calls GitHub: run it
 * outside any scope.
 */
export const connectInstallation = async (installation: GithubInstallation) => {
  const integration = forOrganisation();
  const orgId = requestOrgId();
  const minted = await installationToken(installation.id);
  const keys = { ...minted, installationId: installation.id, account: installation.account };

  return withOrg(orgId, async (tx) => {
    const known = await connectionOfInstallation(tx, installation.id);

    if (known) {
      const [row] = await tx
        .update(integrationConnections)
        .set({ status: 'active', updatedAt: sql`now()` })
        .where(eq(integrationConnections.id, known.id))
        .returning();

      return row ?? known;
    }

    return insertConnection(tx, integration, {
      id: newId(),
      name: await freeName(tx, integration.key, null, installation.account),
      ownerId: null,
      auth: 'app',
      keys,
    });
  });
};

export const connectFromTicket = (input: { ticket: string; installationId: number }) => {
  const ticket = openTicket(input.ticket);
  const installation = ticket?.installations.find((item) => item.id === input.installationId);

  if (
    !ticket ||
    !installation ||
    ticket.orgId !== requestOrgId() ||
    ticket.userId !== caller('user').userId
  ) {
    throw fail('NOT_ALLOWED', 'Sign in to GitHub again to pick an account');
  }

  return connectInstallation(installation);
};

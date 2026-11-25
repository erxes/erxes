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
  appIn,
  type GithubApp,
  type GithubInstallation,
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

/**
 * The GitHub integration and the App it connects through, refused unless the member may connect
 * it for the organisation. Reads the App in its own scope: call it outside any.
 */
const forOrganisation = async () => {
  const integration = keyedOf('github');

  ownerFor(integration, 'org');

  return { integration, app: await withOrg(requestOrgId(), appIn) };
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

export const githubSignIn = async () => {
  const { app } = await forOrganisation();

  return { url: signInUrl(app, newState()) };
};

/** What Settings gets back: the installations the member manages, and where to install more. */
export const ticketFor = (app: GithubApp, installations: GithubInstallation[]) =>
  sealTicket({
    orgId: requestOrgId(),
    userId: caller('user').userId,
    installations,
    installUrl: installUrl(app, newState()),
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
  const { integration, app } = await forOrganisation();
  const orgId = requestOrgId();
  const minted = await installationToken(app, installation.id);
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

import type { IncomingHttpHeaders } from 'node:http';
import { decode, verify } from 'jsonwebtoken';
import { getMessagingApps, type MessagingApp } from './config';
import { messagingError } from './errors';
import {
  generateMessagingModels,
  type MessagingIdentity,
  type MessagingModels,
} from './models';

export const MESSAGING_TOKEN_HEADER = 'x-frontline-messaging-token';

export const authenticateMessagingToken = (
  token: string | string[] | undefined,
  apps: readonly MessagingApp[],
) => {
  if (typeof token !== 'string' || token.length > 8192) {
    throw messagingError('Messaging access token required', 'UNAUTHENTICATED');
  }

  try {
    const decoded = decode(token, { complete: true });
    if (
      !decoded ||
      typeof decoded.payload !== 'object' ||
      typeof decoded.header.kid !== 'string'
    ) {
      throw new Error();
    }
    const { iss, aud } = decoded.payload;
    const app = apps.find(
      ({ issuer, audience }) => issuer === iss && audience === aud,
    );
    const key = app?.keys.get(decoded.header.kid);
    if (!app || !key) throw new Error();

    const claims = verify(token, key, {
      algorithms: ['RS256'],
      issuer: app.issuer,
      audience: app.audience,
      maxAge: '1h',
    });

    if (
      typeof claims === 'string' ||
      claims.token_use !== 'access' ||
      claims.type === 'refresh' ||
      claims.typ === 'refresh' ||
      typeof claims.exp !== 'number' ||
      typeof claims.iat !== 'number' ||
      claims.iat > Math.floor(Date.now() / 1000) + 5 ||
      typeof claims.sub !== 'string' ||
      !claims.sub.trim() ||
      claims.sub.length > 255
    ) {
      throw new Error();
    }

    return {
      app,
      subject: claims.sub,
      accessExpiresAt: Math.min(claims.exp, claims.iat + 3600),
    };
  } catch {
    throw messagingError('Invalid messaging access token', 'UNAUTHENTICATED');
  }
};

export type MessagingRequest = {
  req?: { headers: IncomingHttpHeaders } | null;
};

export const getMessagingCredential = ({ req }: MessagingRequest) =>
  authenticateMessagingToken(
    req?.headers[MESSAGING_TOKEN_HEADER],
    getMessagingApps(),
  );

export interface MessagingActor {
  app: MessagingApp;
  models: MessagingModels;
  member: MessagingIdentity;
  scope: { tenant: string; appId: string };
}

export const loadMessagingAccount = async (request: MessagingRequest) => {
  const { app, subject } = getMessagingCredential(request);
  const scope = { tenant: app.tenant, appId: app.appId };
  // The verified issuer and audience select the database. Gateway routing headers
  // and the resolver's legacy tenant/model context do not participate.
  const models = await generateMessagingModels(app.tenant);
  return {
    app,
    scope,
    models,
    selector: { ...scope, issuer: app.issuer, subject },
  };
};

export const requireMessagingActor = async (
  request: MessagingRequest,
): Promise<MessagingActor> => {
  const { selector, ...context } = await loadMessagingAccount(request);
  const member = await context.models.Identities.findOne({
    ...selector,
    active: true,
  }).lean();
  if (!member)
    throw messagingError('Active messaging membership required', 'FORBIDDEN');
  return { ...context, member };
};

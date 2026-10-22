import * as jwt from 'jsonwebtoken';
import { redis } from 'erxes-api-shared/utils';
import type { IContext } from '~/connectionResolvers';
import { permissions } from '~/meta/permissions';
import { authorizeCredentialManagement } from './access';
import type { CredentialPermission } from './access';
import { CredentialsError } from './types';

const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export const authenticateCredentialManager = async (context: IContext, action: CredentialPermission) => {
  const forwarded: unknown = context.user;
  if (context.cpUser || context.clientPortal || (object(forwarded) &&
      (forwarded.appId || forwarded.oauthClientId || forwarded.oauthScopes))) {
    throw new CredentialsError('CREDENTIALS_FORBIDDEN');
  }
  const authorization = context.req.headers.authorization;
  const cookie: unknown = context.req.cookies?.['auth-token'];
  // The forwarded header is only a token carrier, NEVER identity/permissions.
  const token = typeof authorization === 'string' && authorization.startsWith('Bearer ')
    ? authorization.slice(7)
    : typeof cookie === 'string' ? cookie
    : object(forwarded) && typeof forwarded.loginToken === 'string' ? forwarded.loginToken : '';
  return authorizeCredentialManagement(context.subdomain, token, action, {
    async verifySession(sessionToken) {
      const secret = process.env.JWT_TOKEN_SECRET;
      if (!secret || secret === 'SECRET') throw new CredentialsError('CREDENTIALS_FORBIDDEN');
      const payload: unknown = jwt.verify(sessionToken, secret, { algorithms: ['HS256'] });
      if (!object(payload) || payload.typ !== undefined || typeof payload.exp !== 'number' ||
          !object(payload.user) || typeof payload.user._id !== 'string' || payload.user.appId) {
        throw new CredentialsError('CREDENTIALS_FORBIDDEN');
      }
      return payload.user._id;
    },
    async sessionIsActive(userId, sessionToken) {
      return Boolean(await redis.get(`user_token_${userId}_${sessionToken}`));
    },
    async findUser(userId) {
      return context.models.Users.findOne({ _id: userId, isActive: true })
        .select('_id isActive isOwner appId permissionGroupIds customPermissions').lean();
    },
    async groupPermissions(ids) {
      // Read tenant groups afresh. The general action cache is not tenant-keyed.
      const groups = await context.models.PermissionGroups.find({ _id: { $in: ids } }).select('permissions').lean();
      const defaults = (permissions.defaultGroups || []).filter((group) => ids.includes(group.id));
      return [...groups, ...defaults].flatMap((group) => group.permissions || []);
    },
  });
};

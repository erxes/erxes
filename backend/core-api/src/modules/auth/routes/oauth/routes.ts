import { getSubdomain } from 'erxes-api-shared/utils';
import { Request, Response, Router } from 'express';
import { generateModels } from '~/connectionResolvers';
import {
  ACCESS_TOKEN_EXPIRES_IN_CONFIDENTIAL,
  ACCESS_TOKEN_EXPIRES_IN_PUBLIC,
  DEVICE_CODE_EXPIRES_IN,
  DEVICE_CODE_GRANT,
  DEVICE_POLL_INTERVAL,
  MAX_DEVICE_CODE_FAILED_ATTEMPTS,
  REFRESH_TOKEN_EXPIRES_IN_CONFIDENTIAL,
  REFRESH_TOKEN_EXPIRES_IN_PUBLIC,
} from './constants';
import {
  buildTokenResponse,
  checkRateLimit,
  createOAuthAccessToken,
  createOAuthRefreshToken,
  createRandomToken,
  createUserCode,
  formatUserCode,
  getAuthenticatedUserId,
  getAvailableOAuthScopesForUser,
  getClientIp,
  getOAuthClientApp,
  getOAuthClientInfo,
  getVerificationUri,
  hashToken,
  isClientAuthError,
  isRateLimitError,
  normalizeUserCode,
  sendOAuthError,
  validateClientSecret,
} from './utils';

export const router: Router = Router();

router.post('/oauth/device/code', async (req: Request, res: Response) => {
  try {
    const ip = getClientIp(req);
    await checkRateLimit(`oauth:code:${ip}`, 5, 10 * 60);

    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);
    const clientId = String(req.body?.client_id || '').trim();
    const clientSecret =
      String(req.headers['oauth_secret'] || '').trim() || undefined;

    const oauthClientApp = await getOAuthClientApp(models, clientId);
    validateClientSecret(oauthClientApp, clientSecret);

    let userCode = createUserCode();
    let userCodeHash = hashToken(userCode);

    for (let i = 0; i < 5; i++) {
      const existing = await models.OAuthDeviceCodes.findOne({
        userCodeHash,
        expiresAt: { $gt: new Date() },
      });

      if (!existing) {
        break;
      }

      userCode = createUserCode();
      userCodeHash = hashToken(userCode);
    }

    const deviceCode = createRandomToken(48);
    const expiresAt = new Date(Date.now() + DEVICE_CODE_EXPIRES_IN * 1000);

    await models.OAuthDeviceCodes.create({
      deviceCodeHash: hashToken(deviceCode),
      userCodeHash,
      clientId,
      status: 'pending',
      expiresAt,
    });

    const verificationUri = getVerificationUri();

    return res.json({
      device_code: deviceCode,
      user_code: formatUserCode(userCode),
      verification_uri: verificationUri,
      verification_uri_complete: `${verificationUri}?user_code=${formatUserCode(
        userCode,
      )}`,
      expires_in: DEVICE_CODE_EXPIRES_IN,
      interval: DEVICE_POLL_INTERVAL,
    });
  } catch (e) {
    if (isClientAuthError(e)) {
      return sendOAuthError(res, 401, 'invalid_client', e.message);
    }
    return sendOAuthError(
      res,
      400,
      'invalid_request',
      e instanceof Error ? e.message : 'Invalid request',
    );
  }
});

router.get('/oauth/device/details', async (req: Request, res: Response) => {
  try {
    const ip = getClientIp(req);
    await checkRateLimit(`oauth:details:${ip}`, 15, 60);

    const userId = getAuthenticatedUserId(req);
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);
    const userCode = normalizeUserCode(
      String(req.query?.user_code || req.query?.userCode || ''),
    );

    if (!userCode) {
      return sendOAuthError(res, 400, 'invalid_request', 'Missing user_code');
    }

    const [deviceCode, user] = await Promise.all([
      models.OAuthDeviceCodes.findOne({
        userCodeHash: hashToken(userCode),
        status: 'pending',
        expiresAt: { $gt: new Date() },
      }),
      models.Users.findOne({ _id: userId, isActive: true }),
    ]);

    if (!deviceCode) {
      return sendOAuthError(res, 404, 'invalid_grant', 'Invalid device code');
    }

    if (deviceCode.failedAttempts >= MAX_DEVICE_CODE_FAILED_ATTEMPTS) {
      await models.OAuthDeviceCodes.deleteOne({ _id: deviceCode._id });
      return sendOAuthError(
        res,
        400,
        'access_denied',
        'Too many failed attempts',
      );
    }

    if (!user) {
      return sendOAuthError(res, 401, 'invalid_grant', 'User not found');
    }

    const [scopes, oauthClientApp] = await Promise.all([
      getAvailableOAuthScopesForUser({ subdomain, user }),
      getOAuthClientApp(models, deviceCode.clientId),
    ]);

    return res.json({
      client: getOAuthClientInfo({
        id: oauthClientApp.clientId,
        name: oauthClientApp.name,
        description: oauthClientApp.description || '',
        logo: oauthClientApp.logo,
      }),
      scopes,
    });
  } catch (e) {
    return sendOAuthError(
      res,
      isRateLimitError(e)
        ? 429
        : e instanceof Error && e.message === 'Not authenticated'
        ? 401
        : 400,
      isRateLimitError(e) ? 'rate_limit_exceeded' : 'invalid_request',
      e instanceof Error ? e.message : 'Invalid request',
    );
  }
});

router.post('/oauth/device/approve', async (req: Request, res: Response) => {
  try {
    const ip = getClientIp(req);
    await checkRateLimit(`oauth:approve:${ip}`, 10, 60);

    const userId = getAuthenticatedUserId(req);
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);
    const userCode = normalizeUserCode(String(req.body?.userCode || ''));

    if (!userCode) {
      return sendOAuthError(res, 400, 'invalid_request', 'Missing userCode');
    }

    const deviceCode = await models.OAuthDeviceCodes.findOne({
      userCodeHash: hashToken(userCode),
      status: 'pending',
      expiresAt: { $gt: new Date() },
    });

    if (!deviceCode) {
      return sendOAuthError(res, 404, 'invalid_grant', 'Invalid device code');
    }

    if (deviceCode.failedAttempts >= MAX_DEVICE_CODE_FAILED_ATTEMPTS) {
      await models.OAuthDeviceCodes.deleteOne({ _id: deviceCode._id });
      return sendOAuthError(
        res,
        400,
        'access_denied',
        'Too many failed attempts',
      );
    }

    const [oauthClientApp] = await Promise.all([
      getOAuthClientApp(models, deviceCode.clientId),
      models.OAuthDeviceCodes.updateOne(
        { _id: deviceCode._id },
        { $set: { userId, status: 'approved', approvedAt: new Date() } },
      ),
    ]);

    const redirectUrl = oauthClientApp.redirectUrls?.[0] || null;

    return res.json({ status: 'approved', redirectUrl });
  } catch (e) {
    return sendOAuthError(
      res,
      isRateLimitError(e)
        ? 429
        : e instanceof Error && e.message === 'Not authenticated'
        ? 401
        : 400,
      isRateLimitError(e) ? 'rate_limit_exceeded' : 'invalid_request',
      e instanceof Error ? e.message : 'Invalid request',
    );
  }
});

router.post('/oauth/device/deny', async (req: Request, res: Response) => {
  try {
    getAuthenticatedUserId(req);

    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);
    const userCode = normalizeUserCode(String(req.body?.userCode || ''));

    if (!userCode) {
      return sendOAuthError(res, 400, 'invalid_request', 'Missing userCode');
    }

    const deviceCode = await models.OAuthDeviceCodes.findOne({
      userCodeHash: hashToken(userCode),
      status: 'pending',
      expiresAt: { $gt: new Date() },
    });

    if (!deviceCode) {
      return sendOAuthError(res, 404, 'invalid_grant', 'Invalid device code');
    }

    await models.OAuthDeviceCodes.updateOne(
      { _id: deviceCode._id },
      { $set: { status: 'denied' } },
    );

    return res.json({ status: 'denied' });
  } catch (e) {
    return sendOAuthError(
      res,
      e instanceof Error && e.message === 'Not authenticated' ? 401 : 400,
      'invalid_request',
      e instanceof Error ? e.message : 'Invalid request',
    );
  }
});

router.post('/oauth/token', async (req: Request, res: Response) => {
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);
  const grantType = String(req.body?.grant_type || '').trim();

  if (grantType === DEVICE_CODE_GRANT) {
    try {
      const clientId = String(req.body?.client_id || '').trim();
      const clientSecret =
        String(req.headers['oauth_secret'] || '').trim() || undefined;
      const deviceCode = String(req.body?.device_code || '').trim();

      const oauthClientApp = await getOAuthClientApp(models, clientId);
      validateClientSecret(oauthClientApp, clientSecret);

      if (!deviceCode) {
        return sendOAuthError(
          res,
          400,
          'invalid_request',
          'Missing device_code',
        );
      }

      // RFC 8628 §3.5 — enforce poll interval per device code
      const deviceCodeHash = hashToken(deviceCode);
      await checkRateLimit(
        `oauth:poll:${deviceCodeHash}`,
        1,
        DEVICE_POLL_INTERVAL - 1,
      );

      const deviceCodeDoc = await models.OAuthDeviceCodes.findOne({
        deviceCodeHash,
        clientId,
      });

      if (!deviceCodeDoc || deviceCodeDoc.expiresAt <= new Date()) {
        return sendOAuthError(res, 400, 'expired_token');
      }

      if (deviceCodeDoc.status === 'denied') {
        return sendOAuthError(res, 400, 'access_denied');
      }

      if (deviceCodeDoc.status !== 'approved' || !deviceCodeDoc.userId) {
        await models.OAuthDeviceCodes.updateOne(
          { _id: deviceCodeDoc._id },
          { $set: { lastPolledAt: new Date() } },
        );

        return sendOAuthError(res, 428, 'authorization_pending');
      }

      const user = await models.Users.findOne({
        _id: deviceCodeDoc.userId,
        isActive: true,
      });

      if (!user) {
        return sendOAuthError(res, 400, 'invalid_grant', 'User not found');
      }

      const tokenResponse = await buildTokenResponse({
        models,
        user,
        clientId,
        subdomain,
        clientType: oauthClientApp.type,
      });

      await models.OAuthDeviceCodes.deleteOne({ _id: deviceCodeDoc._id });

      return res.json(tokenResponse);
    } catch (e) {
      if (isRateLimitError(e)) {
        return sendOAuthError(res, 400, 'slow_down');
      }
      if (isClientAuthError(e)) {
        return sendOAuthError(res, 401, 'invalid_client', e.message);
      }
      return sendOAuthError(
        res,
        400,
        'invalid_request',
        e instanceof Error ? e.message : 'Invalid request',
      );
    }
  }

  if (grantType === 'refresh_token') {
    try {
      const clientId = String(req.body?.client_id || '').trim();
      const clientSecret =
        String(req.headers['oauth_secret'] || '').trim() || undefined;
      const refreshToken = String(req.body?.refresh_token || '').trim();

      const oauthClientApp = await getOAuthClientApp(models, clientId);
      validateClientSecret(oauthClientApp, clientSecret);

      if (!refreshToken) {
        return sendOAuthError(
          res,
          400,
          'invalid_request',
          'Missing refresh_token',
        );
      }

      const tokenHash = hashToken(refreshToken);
      const tokenDoc = await models.OAuthRefreshTokens.findOne({
        tokenHash,
        clientId,
        revokedAt: { $exists: false },
        expiresAt: { $gt: new Date() },
      });

      if (!tokenDoc) {
        return sendOAuthError(res, 401, 'invalid_grant');
      }

      const user = await models.Users.findOne({
        _id: tokenDoc.userId,
        isActive: true,
      });

      if (!user) {
        return sendOAuthError(res, 401, 'invalid_grant');
      }

      const accessExpiresIn =
        oauthClientApp.type === 'confidential'
          ? ACCESS_TOKEN_EXPIRES_IN_CONFIDENTIAL
          : ACCESS_TOKEN_EXPIRES_IN_PUBLIC;

      const refreshExpiresIn =
        oauthClientApp.type === 'confidential'
          ? REFRESH_TOKEN_EXPIRES_IN_CONFIDENTIAL
          : REFRESH_TOKEN_EXPIRES_IN_PUBLIC;

      const accessToken = await createOAuthAccessToken({
        models,
        user,
        clientId,
        subdomain,
        expiresIn: accessExpiresIn,
      });

      const nextRefreshToken = await createOAuthRefreshToken({
        models,
        userId: user._id,
        clientId,
        expiresIn: refreshExpiresIn,
      });

      await models.OAuthClientApps.updateOne(
        { clientId },
        { $set: { lastUsedAt: new Date() } },
      );

      await models.OAuthRefreshTokens.updateOne(
        { _id: tokenDoc._id },
        {
          $set: {
            revokedAt: new Date(),
            replacedByTokenHash: nextRefreshToken.tokenHash,
          },
        },
      );

      return res.json({
        tokenType: 'Bearer',
        accessToken,
        refreshToken: nextRefreshToken.refreshToken,
        expiresIn: accessExpiresIn,
        user: await models.Users.getTokenFields(user),
      });
    } catch (e) {
      if (isClientAuthError(e)) {
        return sendOAuthError(res, 401, 'invalid_client', e.message);
      }
      return sendOAuthError(
        res,
        400,
        'invalid_request',
        e instanceof Error ? e.message : 'Invalid request',
      );
    }
  }

  return sendOAuthError(res, 400, 'unsupported_grant_type');
});

router.post('/oauth/revoke', async (req: Request, res: Response) => {
  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);
    const token = String(req.body?.token || '').trim();

    if (!token) {
      return sendOAuthError(res, 400, 'invalid_request', 'Missing token');
    }

    await models.OAuthRefreshTokens.updateOne(
      { tokenHash: hashToken(token), revokedAt: { $exists: false } },
      { $set: { revokedAt: new Date() } },
    );

    return res.json({ status: 'revoked' });
  } catch (e) {
    return sendOAuthError(
      res,
      400,
      'invalid_request',
      e instanceof Error ? e.message : 'Invalid request',
    );
  }
});

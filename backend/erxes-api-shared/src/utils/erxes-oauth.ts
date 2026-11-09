import {
  createHash,
  createPublicKey,
  JsonWebKey,
  KeyObject,
  randomBytes,
  verify,
} from 'crypto';

/**
 * "Sign in with erxes" for products: the client side of core's OAuth
 * authorization code flow with PKCE (`/oauth/authorize`, `/oauth/token`)
 * and verification of the RS256 access tokens core signs
 * (`/.well-known/jwks.json`). A product never needs core's database or secrets.
 */
export interface ErxesOAuthConfig {
  /** Public address of core-api, e.g. `https://erxes.example.com/gateway` or core-api directly. */
  coreUrl: string;
  /** Expected `iss` of access tokens (core's OAUTH_ISSUER, else its DOMAIN). */
  issuer: string;
  clientId: string;
  /** Only for confidential clients. */
  clientSecret?: string;
  /** Must be one of the client's registered redirect URLs. */
  redirectUri: string;
  /** Overridable for tests. */
  fetch?: typeof fetch;
}

export interface ErxesTokenUser {
  _id: string;
  email?: string;
  username?: string;
  isOwner?: boolean;
  details?: { fullName?: string; avatar?: string };
  [key: string]: unknown;
}

export interface ErxesAccessClaims {
  typ: 'erxes_access';
  sub: string;
  /** Subdomain the user signed in on (can be renamed). */
  tid: string;
  /** Permanent id of that organisation (erxes `organization.identity`). */
  oid?: string;
  aud: string;
  iss: string;
  exp: number;
  iat: number;
  scope?: string;
  user: ErxesTokenUser;
}

export interface ErxesTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: ErxesTokenUser;
}

export class ErxesOAuthError extends Error {
  constructor(
    readonly code: string,
    message: string,
    /** `invalid_grant`: the refresh token or code is no longer valid. */
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ErxesOAuthError';
  }
}

const base64url = (value: Buffer) => value.toString('base64url');

/** PKCE pair for one sign-in: keep the verifier, send the challenge. */
export const createPkcePair = () => {
  const verifier = base64url(randomBytes(32));

  return {
    verifier,
    challenge: base64url(createHash('sha256').update(verifier).digest()),
  };
};

export const createOAuthState = () => base64url(randomBytes(24));

const JWKS_TTL_MS = 5 * 60 * 1000;
const CLOCK_SKEW_SECS = 60;

const trimSlash = (value: string) => value.replace(/\/+$/, '');

export const createErxesOAuthClient = (config: ErxesOAuthConfig) => {
  const coreUrl = trimSlash(config.coreUrl);
  const issuer = trimSlash(config.issuer);
  const doFetch = config.fetch ?? fetch;
  let keys: Map<string, KeyObject> = new Map();
  let keysFetchedAt = 0;

  const loadKeys = async () => {
    const response = await doFetch(`${coreUrl}/.well-known/jwks.json`);

    if (!response.ok) {
      throw new ErxesOAuthError(
        'jwks_unavailable',
        `erxes keys unavailable (${response.status})`,
        response.status,
      );
    }

    const body = (await response.json()) as {
      keys?: (JsonWebKey & { kid?: string; alg?: string })[];
    };
    const next = new Map<string, KeyObject>();

    for (const jwk of body.keys ?? []) {
      if (jwk.kid && jwk.kty === 'RSA' && (!jwk.alg || jwk.alg === 'RS256')) {
        next.set(jwk.kid, createPublicKey({ key: jwk, format: 'jwk' }));
      }
    }

    keys = next;
    keysFetchedAt = Date.now();
  };

  /** Cached for 5 minutes; an unknown key id refetches once (key rotation). */
  const keyFor = async (kid: string) => {
    if (!keys.has(kid) || Date.now() - keysFetchedAt > JWKS_TTL_MS) {
      await loadKeys();
    }

    return keys.get(kid) ?? null;
  };

  const tokenRequest = async (body: Record<string, string>) => {
    const response = await doFetch(`${coreUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        client_id: config.clientId,
        ...(config.clientSecret ? { client_secret: config.clientSecret } : {}),
        ...body,
      }),
    });
    const json = (await response.json().catch(() => ({}))) as Partial<
      ErxesTokens & { error: string; error_description: string }
    >;

    if (!response.ok || !json.accessToken || !json.refreshToken) {
      throw new ErxesOAuthError(
        json.error || 'token_request_failed',
        json.error_description || json.error || `HTTP ${response.status}`,
        response.status,
      );
    }

    return {
      accessToken: json.accessToken,
      refreshToken: json.refreshToken,
      expiresIn: Number(json.expiresIn) || 0,
      user: json.user as ErxesTokenUser,
    };
  };

  return {
    /** Where to send the browser; store `state` and the PKCE verifier first. */
    authorizeUrl: ({
      state,
      codeChallenge,
      scope,
    }: {
      state: string;
      codeChallenge: string;
      scope?: string;
    }) => {
      const url = new URL(`${coreUrl}/oauth/authorize`);

      url.searchParams.set('response_type', 'code');
      url.searchParams.set('client_id', config.clientId);
      url.searchParams.set('redirect_uri', config.redirectUri);
      url.searchParams.set('code_challenge', codeChallenge);
      url.searchParams.set('code_challenge_method', 'S256');
      url.searchParams.set('state', state);

      if (scope) url.searchParams.set('scope', scope);

      return url.toString();
    },

    exchangeCode: (code: string, codeVerifier: string) =>
      tokenRequest({
        grant_type: 'authorization_code',
        code,
        code_verifier: codeVerifier,
        redirect_uri: config.redirectUri,
      }),

    refresh: (refreshToken: string) =>
      tokenRequest({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),

    /** Best effort: ends the refresh token at core (sign-out). */
    revoke: async (refreshToken: string) => {
      await doFetch(`${coreUrl}/oauth/revoke`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: refreshToken }),
      }).catch(() => undefined);
    },

    /** Checks signature (RS256 + JWKS), issuer, audience, expiry and type. */
    verifyAccessToken: async (token: string): Promise<ErxesAccessClaims> => {
      const parts = token.split('.');

      if (parts.length !== 3) {
        throw new ErxesOAuthError('invalid_token', 'Malformed token');
      }

      const [encodedHeader, encodedPayload, encodedSignature] = parts;
      let header: { alg?: string; kid?: string };
      let claims: ErxesAccessClaims;

      try {
        header = JSON.parse(Buffer.from(encodedHeader, 'base64url').toString());
        claims = JSON.parse(
          Buffer.from(encodedPayload, 'base64url').toString(),
        );
      } catch {
        throw new ErxesOAuthError('invalid_token', 'Malformed token');
      }

      if (header.alg !== 'RS256' || !header.kid) {
        throw new ErxesOAuthError(
          'invalid_token',
          'Unexpected token algorithm',
        );
      }

      const key = await keyFor(header.kid);
      const valid =
        key &&
        verify(
          'RSA-SHA256',
          Buffer.from(`${encodedHeader}.${encodedPayload}`),
          key,
          Buffer.from(encodedSignature, 'base64url'),
        );

      if (!valid) {
        throw new ErxesOAuthError('invalid_token', 'Invalid token signature');
      }

      const now = Math.floor(Date.now() / 1000);
      const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];

      if (
        claims.typ !== 'erxes_access' ||
        trimSlash(String(claims.iss)) !== issuer ||
        !audiences.includes(config.clientId) ||
        !claims.sub ||
        typeof claims.exp !== 'number' ||
        claims.exp + CLOCK_SKEW_SECS < now
      ) {
        throw new ErxesOAuthError(
          'invalid_token',
          'Token not valid for this app',
        );
      }

      return claims;
    },
  };
};

export type ErxesOAuthClient = ReturnType<typeof createErxesOAuthClient>;

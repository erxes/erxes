export type OAuthClientAppType = 'public' | 'confidential';
export type OAuthClientAppStatus = 'active' | 'revoked';
export type OAuthClientAccessTokenLifetime = 'trio' | 'half' | 'year';

export const OAUTH_CLIENT_ACCESS_TOKEN_LIFETIME_OPTIONS: {
  value: OAuthClientAccessTokenLifetime;
  label: string;
}[] = [
  { value: 'trio', label: '3 months' },
  { value: 'half', label: '6 months' },
  { value: 'year', label: '1 year' },
];

export interface IOAuthClientApp {
  _id: string;
  name: string;
  logo?: string;
  description?: string;
  clientId: string;
  type: OAuthClientAppType;
  accessTokenLifetime?: OAuthClientAccessTokenLifetime;
  redirectUrls: string[];
  status: OAuthClientAppStatus;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt?: string;
  generatedSecret?: string;
}

export interface IOAuthClientAppData {
  oauthClientApps: IOAuthClientApp[];
  oauthClientAppsTotalCount: number;
}

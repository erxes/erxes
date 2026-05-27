export type OAuthClientInfo = {
  id: string;
  name: string;
  description: string;
  logoText: string;
  logo?: string;
};

export type OAuthScopeItem = {
  scope: string;
  description: string;
};

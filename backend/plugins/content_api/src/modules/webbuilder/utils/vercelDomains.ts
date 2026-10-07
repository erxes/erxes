import { getEnv } from 'erxes-api-shared/utils';

/*
 * Custom domains of a web's Vercel project. Vercel owns the domain, the DNS
 * check and the certificate, so nothing is stored on our side: every read
 * asks Vercel, which keeps re-checking DNS on its own.
 */

const API_BASE = 'https://api.vercel.com';

export interface IVercelVerification {
  type: string;
  domain: string;
  value: string;
  reason?: string;
}

export interface IVercelProjectDomain {
  name: string;
  apexName: string;
  verified: boolean;
  verification?: IVercelVerification[];
}

export interface IVercelDomainConfig {
  misconfigured: boolean;
  recommendedIPv4?: { rank: number; value: string[] }[];
  recommendedCNAME?: { rank: number; value: string }[];
}

const request = async <T>(path: string, init: RequestInit = {}) => {
  const token = getEnv({ name: 'VERCEL_TOKEN' });
  const teamId = getEnv({ name: 'VERCEL_TEAM_ID' });

  if (!token) {
    throw new Error('Website hosting is not configured on this installation');
  }

  const url = new URL(`${API_BASE}${path}`);

  if (teamId) {
    url.searchParams.set('teamId', teamId);
  }

  const response = await fetch(url, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      ...init.headers,
    },
    signal: AbortSignal.timeout(20000),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      body?.error?.message || `Vercel answered ${response.status}`,
    );
  }

  return body as T;
};

const encoded = (name: string) => encodeURIComponent(name);

export const listProjectDomains = async (projectId: string) =>
  (
    await request<{ domains?: IVercelProjectDomain[] }>(
      `/v9/projects/${encoded(projectId)}/domains`,
    )
  ).domains || [];

export const addProjectDomain = (projectId: string, name: string) =>
  request<IVercelProjectDomain>(`/v10/projects/${encoded(projectId)}/domains`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });

// Asks Vercel to re-check the ownership TXT record right away.
export const verifyProjectDomain = (projectId: string, name: string) =>
  request<IVercelProjectDomain>(
    `/v9/projects/${encoded(projectId)}/domains/${encoded(name)}/verify`,
    { method: 'POST' },
  );

export const removeProjectDomain = (projectId: string, name: string) =>
  request(`/v9/projects/${encoded(projectId)}/domains/${encoded(name)}`, {
    method: 'DELETE',
  });

export const getDomainConfig = (name: string) =>
  request<IVercelDomainConfig>(`/v6/domains/${encoded(name)}/config`);

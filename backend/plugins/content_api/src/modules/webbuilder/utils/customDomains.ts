import { isIP } from 'node:net';
import { domainToASCII } from 'node:url';
import { IModels } from '~/connectionResolvers';
import {
  addProjectDomain,
  getDomainConfig,
  IVercelDomainConfig,
  IVercelProjectDomain,
  listProjectDomains,
  removeProjectDomain,
  verifyProjectDomain,
} from '@/webbuilder/utils/vercelDomains';

// What Vercel tells every account to point at when it has no specific answer.
const VERCEL_IPV4 = '76.76.21.21';
const VERCEL_CNAME = 'cname.vercel-dns.com';

const RESERVED_SUFFIXES = ['vercel.app', 'erxes.io', 'erxes.tech', 'erxes.mn'];

const LABEL = /^(?!-)[a-z0-9-]{1,63}(?<!-)$/;

const ACTIVE = 'active';
const PENDING = 'pending';

/** "https://Shop.Example.com/" → "shop.example.com" */
const normalizeHostname = (input?: string | null): string => {
  const raw = (input ?? '').trim().toLowerCase();
  const host = raw
    .replace(/^[a-z][a-z0-9+.-]*:\/\//, '')
    .split(/[/?#]/)[0]
    .replace(/:\d+$/, '')
    .replace(/\.$/, '');

  return host ? domainToASCII(host) : '';
};

const validateHostname = (hostname: string) => {
  const labels = hostname.split('.');

  if (
    !hostname ||
    hostname.length > 253 ||
    isIP(hostname) ||
    labels.length < 2 ||
    !labels.every((label) => LABEL.test(label)) ||
    /^\d+$/.test(labels[labels.length - 1])
  ) {
    throw new Error(`Enter a domain such as www.example.com`);
  }

  const reserved = RESERVED_SUFFIXES.find(
    (suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`),
  );

  if (reserved) {
    throw new Error(`Domains under ${reserved} cannot be connected`);
  }
};

const isDefaultDomain = (name: string) => name.endsWith('.vercel.app');

interface ICustomDomainRecord {
  type: string;
  name: string;
  value: string;
  status: string;
}

const pointingRecord = (
  domain: IVercelProjectDomain,
  config: IVercelDomainConfig | null,
): ICustomDomainRecord => {
  const status = config && !config.misconfigured ? ACTIVE : PENDING;

  // A root domain cannot hold a CNAME, so it gets an A record instead.
  if (domain.name === domain.apexName) {
    const ip =
      config?.recommendedIPv4?.find((entry) => entry.rank === 1)?.value?.[0] ||
      VERCEL_IPV4;

    return { type: 'A', name: domain.name, value: ip, status };
  }

  const cname =
    config?.recommendedCNAME?.find((entry) => entry.rank === 1)?.value ||
    VERCEL_CNAME;

  return {
    type: 'CNAME',
    name: domain.name,
    value: cname.replace(/\.$/, ''),
    status,
  };
};

const toView = async (domain: IVercelProjectDomain) => {
  const config = await getDomainConfig(domain.name).catch(() => null);

  const misconfigured = !config || config.misconfigured;

  // Only asked for when Vercel cannot tell the domain is ours, e.g. when it is
  // still attached to a project in another Vercel account.
  const verificationRecords = (domain.verification || []).map((record) => ({
    type: record.type,
    name: record.domain,
    value: record.value,
    status: domain.verified ? ACTIVE : PENDING,
  }));

  return {
    name: domain.name,
    verified: domain.verified,
    misconfigured,
    isActive: domain.verified && !misconfigured,
    records: [pointingRecord(domain, config), ...verificationRecords],
  };
};

const getDeployedWeb = async (models: IModels, webId: string) => {
  const web = await models.Web.findOne({ _id: webId }).lean();

  if (!web) {
    throw new Error('Web not found');
  }

  return web;
};

/** The web's domains as the settings screen shows them. */
export const getCustomDomains = async (models: IModels, webId: string) => {
  const web = await getDeployedWeb(models, webId);

  if (!web.vercelProjectId) {
    return { isDeployed: false, defaultDomain: null, domains: [] };
  }

  const all = await listProjectDomains(web.vercelProjectId);

  return {
    isDeployed: true,
    defaultDomain: all.find((domain) => isDefaultDomain(domain.name))?.name,
    domains: await Promise.all(
      all.filter((domain) => !isDefaultDomain(domain.name)).map(toView),
    ),
  };
};

const requireProject = (web: { vercelProjectId?: string }) => {
  if (!web.vercelProjectId) {
    throw new Error('Deploy the website before connecting a domain');
  }

  return web.vercelProjectId;
};

export const addCustomDomain = async (
  models: IModels,
  webId: string,
  input: string,
) => {
  const web = await getDeployedWeb(models, webId);
  const projectId = requireProject(web);

  const hostname = normalizeHostname(input);
  validateHostname(hostname);

  await addProjectDomain(projectId, hostname);

  return getCustomDomains(models, webId);
};

export const refreshCustomDomain = async (
  models: IModels,
  webId: string,
  hostname: string,
) => {
  const web = await getDeployedWeb(models, webId);
  const projectId = requireProject(web);

  // Vercel answers an error while the TXT record is still missing; the
  // domain list below reports that as pending either way.
  await verifyProjectDomain(projectId, normalizeHostname(hostname)).catch(
    () => undefined,
  );

  return getCustomDomains(models, webId);
};

export const removeCustomDomain = async (
  models: IModels,
  webId: string,
  input: string,
) => {
  const web = await getDeployedWeb(models, webId);
  const projectId = requireProject(web);
  const hostname = normalizeHostname(input);

  if (isDefaultDomain(hostname)) {
    throw new Error('The default vercel.app address cannot be removed');
  }

  await removeProjectDomain(projectId, hostname);

  return getCustomDomains(models, webId);
};

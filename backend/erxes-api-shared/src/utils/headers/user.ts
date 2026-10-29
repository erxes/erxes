import { IncomingHttpHeaders } from 'http';
import { getEnv } from '../utils';
import { signIdentityHeader, verifyIdentityHeader } from './signed';

export const userHeaderName = 'user';
export const clientPortalHeaderName = 'clientportal';
export const cpUserHeaderName = 'cpuser';

const firstHeader = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const requestSubdomain = (headers: IncomingHttpHeaders): string => {
  const hostname =
    firstHeader(headers['nginx-hostname']) ||
    firstHeader(headers.hostname) ||
    headers.host ||
    '';

  return hostname.replace(/(^\w+:|^)\/\//, '').split('.')[0];
};

const isRequestTenant = (headers: IncomingHttpHeaders, subdomain: string) =>
  getEnv({ name: 'VERSION' }) !== 'saas' ||
  requestSubdomain(headers) === subdomain;

function extractIdentityHeader(
  headers: IncomingHttpHeaders,
  name: string,
): any {
  const header = headers[name];

  if (!header) {
    return null;
  }

  if (Array.isArray(header)) {
    throw new Error(`Multiple ${name} headers`);
  }

  const identity = verifyIdentityHeader(name, header);

  if (!identity || !isRequestTenant(headers, identity.subdomain)) {
    return null;
  }

  return identity.value ?? null;
}

export function extractUserFromHeader(headers: IncomingHttpHeaders): any {
  return extractIdentityHeader(headers, userHeaderName);
}

export function extractCPUserFromHeader(headers: IncomingHttpHeaders): any {
  return extractIdentityHeader(headers, cpUserHeaderName);
}

export function extractClientPortalFromHeader(
  headers: IncomingHttpHeaders,
): any {
  return extractIdentityHeader(headers, clientPortalHeaderName);
}

export const USER_HEADER_OMITTED_FIELDS = [
  'emailSignatures',
  'customFieldsData',
  'propertiesData',
  'links',
  'loginToken',
] as const;

export const HEADER_SIZE_WARN_BYTES = 32 * 1024;

function encodeHeader(
  name: string,
  subdomain: string,
  id: string,
  value: unknown,
): string {
  const encoded = signIdentityHeader(name, subdomain, value);

  if (encoded.length > HEADER_SIZE_WARN_BYTES) {
    console.warn(
      `${name} header is ${encoded.length} bytes for ${id}; requests fail once it passes the service header budget`,
    );
  }

  return encoded;
}

export function compactUserForHeader<T extends Record<string, unknown>>(
  user: T,
): Omit<T, (typeof USER_HEADER_OMITTED_FIELDS)[number]> {
  const omitted: readonly string[] = USER_HEADER_OMITTED_FIELDS;

  return Object.fromEntries(
    Object.entries(user).filter(([field]) => !omitted.includes(field)),
  ) as Omit<T, (typeof USER_HEADER_OMITTED_FIELDS)[number]>;
}

export function setUserHeader(
  headers: IncomingHttpHeaders,
  user: any,
  subdomain: string,
) {
  if (!user) return;
  headers[userHeaderName] = encodeHeader(
    userHeaderName,
    subdomain,
    user._id,
    compactUserForHeader(user),
  );
}

export function setCPUserHeader(
  headers: IncomingHttpHeaders,
  cpUser: any,
  subdomain: string,
) {
  if (!cpUser) return;
  headers[cpUserHeaderName] = encodeHeader(
    cpUserHeaderName,
    subdomain,
    cpUser._id,
    cpUser,
  );
}

export function setClientPortalHeader(
  headers: IncomingHttpHeaders,
  clientPortal: any,
  subdomain: string,
) {
  if (!clientPortal) return;
  headers[clientPortalHeaderName] = encodeHeader(
    clientPortalHeaderName,
    subdomain,
    clientPortal._id,
    clientPortal,
  );
}

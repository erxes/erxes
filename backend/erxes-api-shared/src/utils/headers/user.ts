import { IncomingHttpHeaders } from 'http';

export const userHeaderName = 'user';
export const clientPortalHeaderName = 'clientportal';
export const cpUserHeaderName = 'cpuser';

export function extractUserFromHeader(headers: IncomingHttpHeaders): any {
  const userHeader = headers[userHeaderName];
  if (!userHeader) {
    return null;
  }
  if (Array.isArray(userHeader)) {
    throw new Error(`Multiple user headers`);
  }
  const userJson = Buffer.from(userHeader, 'base64').toString('utf-8');
  return JSON.parse(userJson);
}

export function extractCPUserFromHeader(headers: IncomingHttpHeaders): any {
  const cpUserHeader = headers[cpUserHeaderName];

  if (!cpUserHeader) {
    return null;
  }

  if (Array.isArray(cpUserHeader)) {
    throw new Error(`Multiple cp user headers`);
  }
  const cpUserJson = Buffer.from(cpUserHeader, 'base64').toString('utf-8');
  return JSON.parse(cpUserJson);
}

export function extractClientPortalFromHeader(
  headers: IncomingHttpHeaders,
): any {
  const clientPortalHeader = headers[clientPortalHeaderName];

  if (!clientPortalHeader) {
    return null;
  }

  if (Array.isArray(clientPortalHeader)) {
    throw new Error(`Multiple client portal headers`);
  }
  const clientPortalJson = Buffer.from(clientPortalHeader, 'base64').toString(
    'utf-8',
  );
  return JSON.parse(clientPortalJson);
}

export const USER_HEADER_OMITTED_FIELDS = [
  'emailSignatures',
  'customFieldsData',
  'propertiesData',
  'links',
  'loginToken',
] as const;

export const HEADER_SIZE_WARN_BYTES = 32 * 1024;

function encodeHeader(name: string, id: string, value: unknown): string {
  const encoded = Buffer.from(JSON.stringify(value), 'utf8').toString('base64');

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

export function setUserHeader(headers: IncomingHttpHeaders, user: any) {
  if (!user) return;
  headers[userHeaderName] = encodeHeader(
    userHeaderName,
    user._id,
    compactUserForHeader(user),
  );
  headers['userid'] = user._id || '';
}

export function setCPUserHeader(headers: IncomingHttpHeaders, cpUser: any) {
  if (!cpUser) return;
  headers[cpUserHeaderName] = encodeHeader(
    cpUserHeaderName,
    cpUser._id,
    cpUser,
  );
}

export function setClientPortalHeader(
  headers: IncomingHttpHeaders,
  clientPortal: any,
) {
  if (!clientPortal) return;
  const clientPortalJson = JSON.stringify(clientPortal);
  const clientPortalJsonBase64 = Buffer.from(clientPortalJson, 'utf8').toString(
    'base64',
  );

  headers[clientPortalHeaderName] = clientPortalJsonBase64;
}

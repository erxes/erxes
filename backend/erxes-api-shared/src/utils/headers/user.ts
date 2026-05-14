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

export function setUserHeader(headers: IncomingHttpHeaders, user: any) {
  if (!user) return;
  const userJson = JSON.stringify(user);
  const userJsonBase64 = Buffer.from(userJson, 'utf8').toString('base64');
  headers[userHeaderName] = userJsonBase64;
  headers['userid'] = user._id || '';
}

export function setCPUserHeader(headers: IncomingHttpHeaders, cpUser: any) {
  if (!cpUser) return;
  const cpUserJson = JSON.stringify(cpUser);
  const cpUserJsonBase64 = Buffer.from(cpUserJson, 'utf8').toString('base64');
  headers[cpUserHeaderName] = cpUserJsonBase64;
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

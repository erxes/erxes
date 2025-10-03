import { IncomingHttpHeaders } from 'http';

export const userHeaderName = 'user';

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

export function setUserHeader(headers: IncomingHttpHeaders, user: any) {
  if (!user) return;
  const userJson = JSON.stringify(user);
  const userJsonBase64 = Buffer.from(userJson, 'utf8').toString('base64');
  headers[userHeaderName] = userJsonBase64;
  headers['userid'] = user._id || '';
}

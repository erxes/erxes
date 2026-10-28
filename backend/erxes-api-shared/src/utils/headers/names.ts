// Identity headers the gateway mints after authenticating a request.
// Services trust them, so clients must never be able to set them.
export const userHeaderName = 'user';
export const userIdHeaderName = 'userid';
export const clientPortalHeaderName = 'clientportal';
export const cpUserHeaderName = 'cpuser';

// HMAC over the identity headers above plus the tenant, minted by the gateway.
export const identitySignatureHeaderName = 'x-erxes-identity-signature';

export const SIGNED_IDENTITY_HEADERS = [
  userHeaderName,
  userIdHeaderName,
  cpUserHeaderName,
  clientPortalHeaderName,
] as const;

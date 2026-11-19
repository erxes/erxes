type GatewayUser = { isOwner?: boolean; supportFullAccess?: boolean };

/**
 * An erxes support user on a full access grant acts as the workspace owner in every service.
 * The stored user never becomes an owner, so the grant ending (isActive false) ends it too, and
 * owner-only support access controls refuse it by `supportFullAccess`.
 */
export const withSupportFullAccess = <T extends GatewayUser>(user: T): T =>
  user.supportFullAccess === true ? { ...user, isOwner: true } : user;

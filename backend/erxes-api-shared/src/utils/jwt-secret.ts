/**
 * The key every service signs and verifies JWTs with.
 *
 * Outside production an unset or blank JWT_TOKEN_SECRET falls back to 'SECRET'
 * so local setups keep working. In production that fallback would let anyone sign a
 * token the service accepts, so it throws instead — the same rule the client
 * portal JwtManager already applies.
 */
export const getJwtTokenSecret = (): string => {
  const configured = process.env.JWT_TOKEN_SECRET;
  const secret = configured?.trim() ? configured : 'SECRET';

  if (process.env.NODE_ENV === 'production' && secret === 'SECRET') {
    throw new Error('JWT_TOKEN_SECRET must be set in production');
  }

  return secret;
};

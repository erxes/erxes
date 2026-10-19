import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { redis } from 'erxes-api-shared/utils';

export const GATEWAY = process.env.EXT_GATEWAY_URL || 'http://localhost:4000';

// Stand-in for a signed-in browser session: a normal erxes login token for
// `userId`, the same shape and Redis key core-api's login writes. Needs the
// gateway's JWT_TOKEN_SECRET and Redis.
export const loginToken = async (userId: string) => {
  // jti keeps two tokens minted in the same second distinct, so revoking one
  // never revokes the other.
  const token = jwt.sign(
    { user: { _id: userId }, jti: randomUUID() },
    process.env.JWT_TOKEN_SECRET ?? '',
    { expiresIn: 600 },
  );
  await redis.set(`user_token_${userId}_${token}`, '1', 'EX', 600);
  return token;
};

export const postAsUser = async (
  userId: string,
  path: string,
  body: unknown,
) => {
  const res = await fetch(`${GATEWAY}/pl:extensions${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${await loginToken(userId)}`,
    },
    body: JSON.stringify(body),
  });

  return { status: res.status, body: (await res.json()) as unknown };
};

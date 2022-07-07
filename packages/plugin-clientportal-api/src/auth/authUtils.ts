import * as jwt from 'jsonwebtoken';
import { debugInfo } from '@erxes/api-utils/src/debuggers';

export const createJwtToken = payload => {
  const token = jwt.sign(payload, process.env.JWT_TOKEN_SECRET || '', {
    expiresIn: '1d'
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_TOKEN_SECRET || '', {
    expiresIn: '7d'
  });

  return { token, refreshToken };
};

export const verifyJwtToken = token => {
  try {
    const { userId }: any = jwt.verify(
      token,
      process.env.JWT_TOKEN_SECRET || ''
    );
    return userId;
  } catch (err) {
    throw new Error(err.message);
  }
};

export const authCookieOptions = (secure: boolean) => {
  const oneDay = 1 * 24 * 3600 * 1000; // 1 day

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    maxAge: oneDay,
    secure
  };

  return cookieOptions;
};

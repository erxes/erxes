import * as jwt from 'jsonwebtoken';
import { IClientPortal } from '../models/definitions/clientPortal';
import { IUserDocument } from '../models/definitions/clientPortalUser';
import { authCookieOptions, getEnv } from '@erxes/api-utils/src/core';

export const createJwtToken = (payload: any, clientPortal?: IClientPortal) => {
  const { tokenExpiration = 1, refreshTokenExpiration = 7 } = clientPortal || {
    tokenExpiration: 1,
    refreshTokenExpiration: 7,
  };

  const token = jwt.sign(payload, process.env.JWT_TOKEN_SECRET || '', {
    expiresIn: `${tokenExpiration}d`,
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_TOKEN_SECRET || '', {
    expiresIn: `${refreshTokenExpiration}d`,
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

// The variable "isPassed2FA" is True when user approved their otp code
export const tokenHandler = async (
  user: IUserDocument,
  clientPortal: IClientPortal,
  res,
  isPassed2FA = false
) => {
  const cookieOptions: any = {};

  const NODE_ENV = getEnv({ name: 'NODE_ENV' });

  if (!['test', 'development'].includes(NODE_ENV)) {
    cookieOptions.sameSite = 'none';
  }

  const { tokenPassMethod = 'cookie' } = clientPortal;

  const payload = {
    userId: user._id,
    type: user.type,
    isEnableTwoFactor: clientPortal.twoFactorConfig?.enableTwoFactor,
    isPassed2FA,
  };

  const { token, refreshToken } = createJwtToken(payload, clientPortal);

  if (tokenPassMethod === 'header') {
    return { token, refreshToken };
  }

  const { tokenExpiration } = clientPortal;

  if (tokenExpiration) {
    cookieOptions.expires = tokenExpiration * 24 * 60 * 60 * 1000;
  }

  const options = authCookieOptions(cookieOptions);

  res.cookie('client-auth-token', token, options);

  return { refreshToken };
};

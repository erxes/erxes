import { AUTH_MESSAGES } from '../constants';
import { IModels, IContext } from '../connectionResolver';
import * as jwt from 'jsonwebtoken';

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

export const cpUserMiddleware = async (context: IContext) => {
  const { models, requestInfo, res } = context;

  const cp_token = requestInfo.cookies['client-auth-token'];

  if (!cp_token) {
    throw new Error(AUTH_MESSAGES.AUTH_TOKEN_MISSING_ERR);
  }

  try {
    const { userId }: any = jwt.verify(
      cp_token,
      process.env.JWT_TOKEN_SECRET || ''
    );

    const a = jwt.verify(cp_token, process.env.JWT_TOKEN_SECRET || '');

    console.log('*********************** ', userId);

    const userDoc = await models.ClientPortalUsers.findOne({ _id: userId });

    if (!userDoc) {
      throw new Error(AUTH_MESSAGES.USER_NOT_FOUND_ERR);
    }

    // save user in request
    requestInfo.cpUser = userDoc;
    requestInfo.cpUser.loginToken = cp_token;
    requestInfo.cpUser.sessionCode = requestInfo.headers.sessioncode || '';
  } catch (e) {
    throw new Error(`Something went wrong: ${e.message}`);
  }
};

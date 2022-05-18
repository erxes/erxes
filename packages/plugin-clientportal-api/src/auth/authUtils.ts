import { AUTH_MESSAGES } from '../constants';
import { IModels, IContext } from '../connectionResolver';
import * as jwt from 'jsonwebtoken';

export const createJwtToken = payload => {
  const token = jwt.sign(payload, process.env.JWT_TOKEN_SECRET || '', {
    expiresIn: '12h'
  });
  return token;
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

export const cpMiddleware = async (context: IContext) => {
  const { models, requestInfo, res } = context;

  try {
    // check for auth header from client
    const clientPortalId = (
      requestInfo.headers['client-portal-id'] || ''
    ).toString();

    if (!clientPortalId) {
      throw new Error('Client portal id is missing !');
    }

    const clientPortal = await models.ClientPortals.getConfig(
      String(clientPortalId)
    );

    res.locals.clientPortal = clientPortal;
  } catch (err) {
    throw new Error(err.message);
  }
};

export const cpUserMiddleware = async (context: IContext) => {
  const { models, requestInfo, res } = context;

  try {
    // check for auth header from client
    const { authorization } = requestInfo.headers;

    if (!authorization) {
      throw new Error(AUTH_MESSAGES.AUTH_HEADER_MISSING_ERR);
    }

    // verify  auth token
    const token = authorization.split('Bearer ')[1];

    if (!token) {
      throw new Error(AUTH_MESSAGES.AUTH_TOKEN_MISSING_ERR);
    }

    const userId = verifyJwtToken(token);

    if (!userId) {
      throw new Error(AUTH_MESSAGES.JWT_DECODE_ERR);
    }

    const user = await models.ClientPortalUsers.findById(userId);

    if (!user) {
      throw new Error(AUTH_MESSAGES.USER_NOT_FOUND_ERR);
    }

    res.locals.user = user;
  } catch (err) {
    throw new Error(err.message);
  }
};

import { IContext } from '~/connectionResolvers';
import { ICPUserRegisterParams } from '@/clientportal/types/cpUser';
import { Resolver } from 'erxes-api-shared/core-types';
import { markResolvers } from 'erxes-api-shared/utils';
import { IClientPortalDocument } from '~/modules/clientportal/types/clientPortal';
import * as jwt from 'jsonwebtoken';
import { authCookieOptions } from 'erxes-api-shared/utils';

import dotenv from 'dotenv';
dotenv.config();

const createJwtToken = (payload: any, clientPortal?: IClientPortalDocument) => {
  const { tokenExpiration = 1, refreshTokenExpiration = 7 } = clientPortal || {
    tokenExpiration: 1,
    refreshTokenExpiration: 7,
  };

  const token = jwt.sign(payload, process.env.JWT_TOKEN_SECRET || 'SECRET', {
    expiresIn: `${tokenExpiration}d`,
  });

  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_TOKEN_SECRET || 'SECRET',
    {
      expiresIn: `${refreshTokenExpiration}d`,
    },
  );

  return { token, refreshToken };
};

const createAuthCookie = (
  payload: any,
  clientPortal?: IClientPortalDocument,
  res?: any,
) => {
  if (!res) {
    return;
  }

  const { token } = createJwtToken(payload, clientPortal);
  const cookieOptions: any = {};

  return res.cookie(
    'client-auth-token',
    token,
    authCookieOptions(cookieOptions),
  );
};

export const cpUserMutations: Record<string, Resolver> = {
  async clientPortalUserRegister(
    _root: unknown,
    params: ICPUserRegisterParams,
    { models, subdomain, clientPortal }: IContext,
  ) {
    return models.CPUser.registerUser(subdomain, clientPortal, params);
  },

  async clientPortalUserVerify(
    _root: unknown,
    {
      userId,
      code,
      email,
      phone,
    }: { userId: string; code: number; email: string; phone: string },
    { models, clientPortal, res }: IContext,
  ) {
    const user = await models.CPUser.verifyUser(
      userId,
      email,
      phone,
      code,
      clientPortal,
    );

    const payload = {
      userId: user._id,
    };

    createAuthCookie(payload, clientPortal, res);

    return user;
  },

  async clientPortalUserLoginWithCredentials(
    _root: unknown,
    {
      email,
      phone,
      password,
    }: { email: string; phone: string; password: string },
    { models, clientPortal, res }: IContext,
  ) {
    const user = await models.CPUser.login(
      email,
      phone,
      password,
      clientPortal,
    );

    if (!user) {
      throw new Error('Invalid login');
    }

    const payload = {
      userId: user._id,
    };

    createAuthCookie(payload, clientPortal, res);

    return 'Success';
  },
  async clientPortalLogout(_root: unknown, _args: unknown, { res }: IContext) {
    res.clearCookie(
      'client-auth-token',
      authCookieOptions({ sameSite: 'none' }),
    );
    return 'loggedout';
  },
};

markResolvers(cpUserMutations, {
  wrapperConfig: {
    forClientPortal: true,
  },
});

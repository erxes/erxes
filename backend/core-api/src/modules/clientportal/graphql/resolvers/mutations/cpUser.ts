import { IContext } from '~/connectionResolvers';
import { ICPUserRegisterParams } from '@/clientportal/types/cpUser';
import { Resolver } from 'erxes-api-shared/core-types';
import { getEnv, markResolvers } from 'erxes-api-shared/utils';
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
    { userId, code }: { userId: string; code: number },
    { models }: IContext,
  ) {
    return models.CPUser.verifyUser(userId, code);
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

    const { token } = createJwtToken(
      {
        userId: user._id,
      },
      clientPortal,
    );
    const cookieOptions: any = {};

    const NODE_ENV = getEnv({ name: 'NODE_ENV' });

    if (!['test', 'development'].includes(NODE_ENV)) {
      cookieOptions.sameSite = 'none';
      cookieOptions.secure = true;
    }

    res.cookie('client-auth-token', token, authCookieOptions(cookieOptions));

    return 'Success';
  },
};

markResolvers(cpUserMutations, {
  wrapperConfig: {
    forClientPortal: true,
  },
});

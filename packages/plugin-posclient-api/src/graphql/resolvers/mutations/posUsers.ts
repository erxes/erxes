import { authCookieOptions } from '@erxes/api-utils/src/core';
import * as express from 'express';
import { IModels } from '../../../connectionResolver';
import { IPosUser } from '../../../models/definitions/posUsers';
import { IContext } from '../../types';

interface IPosLogin {
  email: string;
  password: string;
  deviceToken?: string;
}

const login = async (
  models: IModels,
  args: IPosLogin,
  res: express.Response,
  secure: boolean
) => {
  const response = await models.PosUsers.posLogin(args);

  const { token } = response;

  res.cookie('pos-auth-token', token, authCookieOptions(secure));

  return 'loggedIn';
};

const posUserMutations = {
  async posUsersCreateOwner(
    _root,
    {
      email,
      password
    }: {
      email: string;
      password: string;
      firstName: string;
      purpose: string;
      lastName?: string;
      subscribeEmail?: boolean;
    },
    { models }: IContext
  ) {
    const userCount = await models.PosUsers.countDocuments();

    if (userCount > 0) {
      throw new Error('Access denied');
    }

    const doc: IPosUser = {
      isOwner: true,
      email: (email || '').toLowerCase().trim(),
      password: (password || '').trim()
    };

    await models.PosUsers.createUser(doc);

    return 'success';
  },
  /*
   * Login
   */
  async posLogin(
    _root,
    args: IPosLogin,
    { res, requestInfo, models }: IContext
  ) {
    return login(models, args, res, requestInfo.secure);
  },

  async posLogout(_root, _args, { res }) {
    res.cookie('pos-auth-token', '1', { maxAge: 0 });
    return 'loggedout';
  }
};

export default posUserMutations;

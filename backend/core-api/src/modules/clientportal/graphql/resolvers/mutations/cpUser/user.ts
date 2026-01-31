import { IContext } from '~/connectionResolvers';
import { Resolver } from 'erxes-api-shared/core-types';
import {
  cpUserService,
  socialAuthService,
} from '@/clientportal/services';
import { getCPUserByIdOrThrow } from '@/clientportal/services/helpers/userUtils';
import {
  AuthenticationError,
  ValidationError,
} from '@/clientportal/services/errorHandler';
import type {
  EditUserParams,
  SocialAuthParams,
  UnlinkSocialParams,
  FcmTokenParams,
} from '@/clientportal/types/cpUserParams';

export const userMutations: Record<string, Resolver> = {
  async clientPortalUserEdit(
    _root: unknown,
    params: EditUserParams,
    { models, cpUser }: IContext,
  ) {
    if (!cpUser) {
      throw new AuthenticationError('User not authenticated');
    }

    return cpUserService.updateUser(cpUser._id, params, models);
  },

  async clientPortalUserLinkSocialAccount(
    _root: unknown,
    { provider, token }: SocialAuthParams,
    { models, clientPortal, cpUser }: IContext,
  ) {
    if (!cpUser) {
      throw new AuthenticationError('Authentication required');
    }

    const user = await socialAuthService.linkSocialAccount(
      cpUser._id,
      provider,
      token,
      clientPortal,
      models,
    );

    return user;
  },

  async clientPortalUserUnlinkSocialAccount(
    _root: unknown,
    { provider }: UnlinkSocialParams,
    { models, cpUser }: IContext,
  ) {
    if (!cpUser) {
      throw new AuthenticationError('Authentication required');
    }

    const user = await socialAuthService.unlinkSocialAccount(
      cpUser._id,
      provider,
      models,
    );
    return user;
  },

  async clientPortalUserAddFcmToken(
    _root: unknown,
    { fcmToken }: FcmTokenParams,
    { models, cpUser }: IContext,
  ) {
    if (!cpUser) {
      throw new AuthenticationError('User not authenticated');
    }

    const trimmed = (fcmToken || '').trim();
    if (!trimmed) {
      throw new ValidationError('FCM token is required');
    }

    await models.CPUser.updateOne(
      { _id: cpUser._id },
      { $addToSet: { fcmTokens: trimmed } },
    );

    return getCPUserByIdOrThrow(cpUser._id, models);
  },

  async clientPortalUserRemoveFcmToken(
    _root: unknown,
    { fcmToken }: FcmTokenParams,
    { models, cpUser }: IContext,
  ) {
    if (!cpUser) {
      throw new AuthenticationError('User not authenticated');
    }

    await models.CPUser.updateOne(
      { _id: cpUser._id },
      { $pull: { fcmTokens: (fcmToken || '').trim() } },
    );

    return getCPUserByIdOrThrow(cpUser._id, models);
  },
};

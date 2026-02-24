import { IContext } from '~/connectionResolvers';
import { Resolver } from 'erxes-api-shared/core-types';
import {
  cpUserService,
  socialAuthService,
  changeContactService,
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
  FcmTokenAddParams,
  FcmTokenRemoveParams,
  RequestChangeEmailParams,
  ConfirmChangeEmailParams,
  RequestChangePhoneParams,
  ConfirmChangePhoneParams,
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
    { deviceId, token, platform }: FcmTokenAddParams,
    { models, cpUser }: IContext,
  ) {
    if (!cpUser) {
      throw new AuthenticationError('User not authenticated');
    }

    const trimmedDeviceId = (deviceId || '').trim();
    const trimmedToken = (token || '').trim();
    if (!trimmedDeviceId) {
      throw new ValidationError('deviceId is required');
    }
    if (!trimmedToken) {
      throw new ValidationError('FCM token is required');
    }
    if (!['ios', 'android', 'web'].includes(platform)) {
      throw new ValidationError('platform must be ios, android, or web');
    }

    const doc = await models.CPUser.findById(cpUser._id).lean();
    const current = (doc?.fcmTokens || []) as Array<{
      deviceId: string;
      token: string;
      platform: string;
    }>;
    const existingIndex = current.findIndex(
      (d) => d.deviceId === trimmedDeviceId,
    );
    const entry = {
      deviceId: trimmedDeviceId,
      token: trimmedToken,
      platform,
    };
    const next =
      existingIndex >= 0
        ? current.map((d, i) => (i === existingIndex ? entry : d))
        : [...current, entry];

    await models.CPUser.updateOne(
      { _id: cpUser._id },
      { $set: { fcmTokens: next } },
    );

    return getCPUserByIdOrThrow(cpUser._id, models);
  },

  async clientPortalUserRemoveFcmToken(
    _root: unknown,
    { deviceId }: FcmTokenRemoveParams,
    { models, cpUser }: IContext,
  ) {
    if (!cpUser) {
      throw new AuthenticationError('User not authenticated');
    }

    const trimmedDeviceId = (deviceId || '').trim();
    if (!trimmedDeviceId) {
      throw new ValidationError('deviceId is required');
    }

    await models.CPUser.updateOne(
      { _id: cpUser._id },
      { $pull: { fcmTokens: { deviceId: trimmedDeviceId } } },
    );

    return getCPUserByIdOrThrow(cpUser._id, models);
  },

  async clientPortalUserRequestChangeEmail(
    _root: unknown,
    { newEmail }: RequestChangeEmailParams,
    { models, subdomain, clientPortal, cpUser }: IContext,
  ) {
    if (!cpUser) {
      throw new AuthenticationError('User not authenticated');
    }
    await changeContactService.requestChangeEmail(
      cpUser._id,
      newEmail,
      clientPortal,
      models,
      subdomain,
    );
    return 'OTP has been sent to your new email';
  },

  async clientPortalUserConfirmChangeEmail(
    _root: unknown,
    { code }: ConfirmChangeEmailParams,
    { models, cpUser }: IContext,
  ) {
    if (!cpUser) {
      throw new AuthenticationError('User not authenticated');
    }
    return changeContactService.confirmChangeEmail(cpUser._id, code, models);
  },

  async clientPortalUserRequestChangePhone(
    _root: unknown,
    { newPhone }: RequestChangePhoneParams,
    { models, subdomain, clientPortal, cpUser }: IContext,
  ) {
    if (!cpUser) {
      throw new AuthenticationError('User not authenticated');
    }
    await changeContactService.requestChangePhone(
      cpUser._id,
      newPhone,
      clientPortal,
      models,
      subdomain,
    );
    return 'OTP has been sent to your new phone';
  },

  async clientPortalUserConfirmChangePhone(
    _root: unknown,
    { code }: ConfirmChangePhoneParams,
    { models, cpUser }: IContext,
  ) {
    if (!cpUser) {
      throw new AuthenticationError('User not authenticated');
    }
    return changeContactService.confirmChangePhone(cpUser._id, code, models);
  },
};

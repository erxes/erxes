import { IModels } from '~/connectionResolvers';
import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import { ICPUserDocument } from '@/clientportal/types/cpUser';
import { updateLastLogin } from '@/clientportal/services/helpers/userUtils';
import {
  SocialAuthProvider,
  SocialUserProfile,
  getSocialUserProfile,
} from '~/modules/clientportal/services/helpers/socialAuth';
import { contactService } from './contactService';
import { AuthenticationError, ValidationError } from './errorHandler';
import { getCPUserByIdOrThrow } from './helpers/userUtils';

export class SocialAuthService {
  private buildSocialAuthQuery(
    provider: SocialAuthProvider,
    profile: SocialUserProfile,
    clientPortalId: string,
  ): Record<string, any> {
    const query: Record<string, any> = {
      clientPortalId,
      $or: [
        {
          'socialAuthProviders.provider': provider,
          'socialAuthProviders.providerId': profile.providerId,
        },
      ],
    };

    if (profile.email) {
      query.$or.push({
        email: { $regex: new RegExp(`^${profile.email}$`, 'i') },
      });
    }

    return query;
  }

  private hasSocialProvider(
    user: ICPUserDocument,
    provider: SocialAuthProvider,
    providerId: string,
  ): boolean {
    return (
      user.socialAuthProviders?.some(
        (p) => p.provider === provider && p.providerId === providerId,
      ) ?? false
    );
  }

  private createSocialAuthProvider(
    provider: SocialAuthProvider,
    profile: SocialUserProfile,
  ) {
    return {
      provider,
      providerId: profile.providerId,
      email: profile.email,
      linkedAt: new Date(),
    };
  }

  private async linkSocialProviderToUser(
    userId: string,
    provider: SocialAuthProvider,
    profile: SocialUserProfile,
    models: IModels,
  ): Promise<void> {
    const user = await models.CPUser.findOne({ _id: userId });
    if (!user) {
      return;
    }

    const socialAuthProviders = user.socialAuthProviders || [];
    socialAuthProviders.push(this.createSocialAuthProvider(provider, profile));

    await models.CPUser.updateOne(
      { _id: userId },
      {
        $set: {
          socialAuthProviders,
          primaryAuthMethod: user.primaryAuthMethod || 'social',
        },
      },
    );
  }

  async registerWithSocial(
    provider: SocialAuthProvider,
    profile: SocialUserProfile,
    clientPortal: IClientPortalDocument,
    models: IModels,
  ): Promise<ICPUserDocument> {
    const query = this.buildSocialAuthQuery(
      provider,
      profile,
      clientPortal._id,
    );
    let user = await models.CPUser.findOne(query);

    if (user) {
      if (!this.hasSocialProvider(user, provider, profile.providerId)) {
        await this.linkSocialProviderToUser(
          user._id,
          provider,
          profile,
          models,
        );
      }
      return user;
    }

    const document = {
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      clientPortalId: clientPortal._id,
      isVerified: true,
      isEmailVerified: !!profile.email,
      primaryAuthMethod: 'social' as const,
      socialAuthProviders: [this.createSocialAuthProvider(provider, profile)],
    };

    await contactService.handleCPContacts(
      models,
      clientPortal._id,
      document,
      undefined,
    );

    const createdUser = await models.CPUser.findOne({
      clientPortalId: clientPortal._id,
      'socialAuthProviders.provider': provider,
      'socialAuthProviders.providerId': profile.providerId,
    });

    if (!createdUser) {
      throw new AuthenticationError('Failed to create user');
    }

    return createdUser;
  }

  private async findUserBySocialProvider(
    provider: SocialAuthProvider,
    providerId: string,
    clientPortalId: string,
    models: IModels,
  ): Promise<ICPUserDocument | null> {
    return models.CPUser.findOne({
      clientPortalId,
      'socialAuthProviders.provider': provider,
      'socialAuthProviders.providerId': providerId,
    });
  }

  private async findUserByEmail(
    email: string,
    clientPortalId: string,
    models: IModels,
  ): Promise<ICPUserDocument | null> {
    return models.CPUser.findOne({
      clientPortalId,
      email: { $regex: new RegExp(`^${email}$`, 'i') },
    });
  }

  async loginWithSocial(
    provider: SocialAuthProvider,
    token: string,
    clientPortal: IClientPortalDocument,
    models: IModels,
  ): Promise<ICPUserDocument> {
    const profile = await getSocialUserProfile(provider, token, clientPortal);

    let user = await this.findUserBySocialProvider(
      provider,
      profile.providerId,
      clientPortal._id,
      models,
    );

    if (!user && profile.email) {
      user = await this.findUserByEmail(
        profile.email,
        clientPortal._id,
        models,
      );

      if (user) {
        await this.linkSocialProviderToUser(
          user._id,
          provider,
          profile,
          models,
        );
      }
    }

    if (!user) {
      return this.registerWithSocial(provider, profile, clientPortal, models);
    }

    await updateLastLogin(user._id, models);
    return user;
  }

  private async checkDuplicateSocialAccount(
    provider: SocialAuthProvider,
    providerId: string,
    clientPortalId: string,
    excludeUserId: string,
    models: IModels,
  ): Promise<void> {
    const existingUser = await models.CPUser.findOne({
      clientPortalId,
      'socialAuthProviders.provider': provider,
      'socialAuthProviders.providerId': providerId,
      _id: { $ne: excludeUserId },
    });

    if (existingUser) {
      throw new ValidationError(
        'This social account is already linked to another user',
      );
    }
  }

  async linkSocialAccount(
    userId: string,
    provider: SocialAuthProvider,
    token: string,
    clientPortal: IClientPortalDocument,
    models: IModels,
  ): Promise<ICPUserDocument> {
    const user = await getCPUserByIdOrThrow(userId, models);

    if (user.clientPortalId !== clientPortal._id) {
      throw new AuthenticationError('User not found');
    }

    const profile = await getSocialUserProfile(provider, token, clientPortal);

    await this.checkDuplicateSocialAccount(
      provider,
      profile.providerId,
      clientPortal._id,
      userId,
      models,
    );

    if (this.hasSocialProvider(user, provider, profile.providerId)) {
      throw new ValidationError('Social account is already linked');
    }

    await this.linkSocialProviderToUser(userId, provider, profile, models);

    return getCPUserByIdOrThrow(userId, models);
  }

  private canUnlinkSocialAccount(
    user: ICPUserDocument,
    provider: SocialAuthProvider,
  ): boolean {
    if (user.primaryAuthMethod !== 'social') {
      return true;
    }

    const socialProviders = user.socialAuthProviders || [];
    const providerCount = socialProviders.filter(
      (p) => p.provider === provider,
    ).length;

    return !(providerCount === 1 && socialProviders.length === 1);
  }

  async unlinkSocialAccount(
    userId: string,
    provider: SocialAuthProvider,
    models: IModels,
  ): Promise<ICPUserDocument> {
    const user = await getCPUserByIdOrThrow(userId, models);

    if (!this.canUnlinkSocialAccount(user, provider)) {
      throw new ValidationError('Cannot unlink the only authentication method');
    }

    const socialAuthProviders = (user.socialAuthProviders || []).filter(
      (p) => p.provider !== provider,
    );

    await models.CPUser.updateOne(
      { _id: userId },
      { $set: { socialAuthProviders } },
    );

    return getCPUserByIdOrThrow(userId, models);
  }
}

export const socialAuthService = new SocialAuthService();

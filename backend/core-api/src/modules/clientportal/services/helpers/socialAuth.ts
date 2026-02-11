import { IClientPortalDocument } from '@/clientportal/types/clientPortal';

export type SocialAuthProvider = 'GOOGLE' | 'APPLE' | 'FACEBOOK';

export interface SocialUserProfile {
  providerId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  picture?: string;
}

export async function getGoogleAuthUrl(
  clientId: string,
  redirectUri: string,
  state?: string,
): Promise<string> {
  return '';
}

export async function verifyGoogleToken(
  token: string,
  clientId: string,
): Promise<SocialUserProfile> {
  try {
    return {
      providerId: '',
      email: '',
      firstName: '',
      lastName: '',
      name: '',
      picture: '',
    };
  } catch (error) {
    throw new Error(
      `Google token verification failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
  }
}

export async function verifyAppleToken(
  token: string,
  clientId: string,
): Promise<SocialUserProfile> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid Apple token format');
    }

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8'),
    );

    if (payload.iss !== 'https://appleid.apple.com') {
      throw new Error('Invalid Apple token issuer');
    }

    if (payload.aud !== clientId) {
      throw new Error('Invalid Apple token audience');
    }

    return {
      providerId: payload.sub,
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
    };
  } catch (error) {
    throw new Error(
      `Apple token verification failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
  }
}

export async function verifyFacebookToken(
  accessToken: string,
  appId: string,
  appSecret: string,
): Promise<SocialUserProfile> {
  try {
    const verifyUrl = `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${appId}|${appSecret}`;
    const verifyResponse = await fetch(verifyUrl);
    const verifyData = await verifyResponse.json();

    if (!verifyData.data || !verifyData.data.is_valid) {
      throw new Error('Invalid Facebook token');
    }

    const profileUrl = `https://graph.facebook.com/me?fields=id,email,first_name,last_name,name,picture&access_token=${accessToken}`;
    const profileResponse = await fetch(profileUrl);
    const profile = await profileResponse.json();

    if (profile.error) {
      throw new Error(`Facebook API error: ${profile.error.message}`);
    }

    return {
      providerId: profile.id,
      email: profile.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
      name: profile.name,
      picture: profile.picture?.data?.url,
    };
  } catch (error) {
    throw new Error(
      `Facebook token verification failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
  }
}

export async function getSocialAuthUrl(
  provider: SocialAuthProvider,
  clientPortal: IClientPortalDocument,
  redirectUri: string,
  state?: string,
): Promise<string> {
  switch (provider) {
    case 'GOOGLE': {
      const googleOAuth = clientPortal.auth?.googleOAuth;
      if (!googleOAuth?.clientId) {
        throw new Error('Google OAuth not configured');
      }
      return getGoogleAuthUrl(googleOAuth.clientId, redirectUri, state);
    }
    case 'APPLE':
      throw new Error('Apple Sign In should be handled client-side');

    case 'FACEBOOK': {
      const facebookOAuth = clientPortal.auth?.facebookOAuth;
      if (!facebookOAuth?.appId) {
        throw new Error('Facebook OAuth not configured');
      }
      const fbRedirectUri = facebookOAuth.redirectUri || redirectUri;
      const encodedRedirectUri = encodeURIComponent(fbRedirectUri);
      return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${
        facebookOAuth.appId
      }&redirect_uri=${encodedRedirectUri}&scope=email,public_profile&state=${
        state || ''
      }`;
    }
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export async function getSocialUserProfile(
  provider: SocialAuthProvider,
  token: string,
  clientPortal: IClientPortalDocument,
): Promise<SocialUserProfile> {
  switch (provider) {
    case 'GOOGLE': {
      const googleOAuth = clientPortal.auth?.googleOAuth;
      if (!googleOAuth?.clientId) {
        throw new Error('Google OAuth not configured');
      }
      return verifyGoogleToken(token, googleOAuth.clientId);
    }
    case 'APPLE':
      throw new Error('Apple OAuth not configured');

    case 'FACEBOOK': {
      const facebookOAuth = clientPortal.auth?.facebookOAuth;
      if (!facebookOAuth?.appId) {
        throw new Error('Facebook OAuth not configured');
      }
      if (!facebookOAuth.appSecret) {
        throw new Error('Facebook app secret not configured');
      }
      return verifyFacebookToken(
        token,
        facebookOAuth.appId,
        facebookOAuth.appSecret,
      );
    }
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

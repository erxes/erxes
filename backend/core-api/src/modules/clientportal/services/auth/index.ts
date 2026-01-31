import {
  generateTokenPair,
  setAuthCookie,
  setAccessTokenCookie,
  refreshAccessToken,
  refreshAndSetAuth,
  clearAuthCookie,
  createClientPortalToken,
} from './authService';

export * from './authService';

export const authService = {
  generateTokenPair,
  setAuthCookie,
  setAccessTokenCookie,
  refreshAccessToken,
  refreshAndSetAuth,
  clearAuthCookie,
  createClientPortalToken,
};

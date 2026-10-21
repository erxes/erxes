/** Opens the page itself on Facebook; the numeric id always resolves. */
export const getFacebookPageUrl = (pageId: string) =>
  `https://www.facebook.com/${pageId}`;

/**
 * A page's public profile picture, loaded by the browser without a token, so
 * it costs neither the page nor the app any Graph quota.
 */
export const getFacebookPagePictureUrl = (pageId: string) =>
  `https://graph.facebook.com/${pageId}/picture?type=square`;

// Lives in utils so the gateway can read it without loading core-modules
export const USER_ACTIVITY_TRACKING_CONFIG = 'USER_ACTIVITY_TRACKING';

/** Redis marker that the organization turned activity tracking on; absent means off. */
export const userActivityTrackingKey = (subdomain: string) =>
  `user_activity_tracking:${subdomain}`;

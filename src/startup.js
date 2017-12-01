import './cronJobs';
import { trackIntegrations as trackTwitters } from './social/twitterTracker';
import { trackIntegrations as trackFacebooks } from './social/facebookTracker';

export const init = app => {
  trackTwitters();
  trackFacebooks(app);
};

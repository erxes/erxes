import './cronJobs';
import { trackIntegrations as trackTwitters } from './social/twitterTracker';
import { trackIntegrations as trackFacebooks } from './social/facebookTracker';
import { trackEngages } from './social/engageTracker';

export const init = app => {
  trackTwitters();
  trackEngages(app);
  trackFacebooks(app);
};

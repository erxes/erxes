import './cronJobs';
import { trackIntegrations as trackTwitters } from './trackers/twitterTracker';
import { trackIntegrations as trackFacebooks } from './trackers/facebookTracker';
import { trackEngages } from './trackers/engageTracker';

export const init = app => {
  trackTwitters();
  trackEngages(app);
  trackFacebooks(app);
};

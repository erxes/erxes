import { trackEngages } from './trackers/engageTracker';

export const init = async app => {
  trackEngages(app);
};

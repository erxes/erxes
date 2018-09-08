import fs from 'fs';
import './cronJobs';
import { trackIntegrations as trackTwitters } from './trackers/twitterTracker';
import { trackIntegrations as trackFacebooks } from './trackers/facebookTracker';
import { trackEngages } from './trackers/engageTracker';

export const init = async app => {
  const makeDirs = () => {
    const dir = `${__dirname}/private/xlsTemplateOutputs`;

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  };

  trackTwitters();
  trackEngages(app);
  trackFacebooks(app);

  makeDirs();
};

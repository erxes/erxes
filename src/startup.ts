import * as dotenv from 'dotenv';
import * as fs from 'fs';
import './cronJobs';
import { trackEngages } from './trackers/engageTracker';
import { trackFbLogin, trackIntegrations as trackFacebooks } from './trackers/facebookTracker';
import { trackGmail, trackGmailLogin } from './trackers/gmailTracker';
import { trackIntegrations as trackTwitters } from './trackers/twitterTracker';

dotenv.config();

export const init = async app => {
  const makeDirs = () => {
    const dir = `${__dirname}/private/xlsTemplateOutputs`;

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  };

  try {
    trackTwitters();
    trackEngages(app);
    trackFacebooks(app);
    trackGmail();
    trackFbLogin(app);
    trackGmailLogin(app);
  } catch (e) {
    console.log(e.toString());
  }

  makeDirs();
};

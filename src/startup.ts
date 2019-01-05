import * as dotenv from 'dotenv';
import * as fs from 'fs';
import './cronJobs';
import { listenChangeConversation } from './db/listener';
import { trackEngages } from './trackers/engageTracker';
import { trackFbLogin, trackIntegrations as trackFacebooks } from './trackers/facebookTracker';
import { trackGmail } from './trackers/gmailTracker';
import { trackIntegrations as trackTwitters } from './trackers/twitterTracker';

dotenv.config();

const { USE_REPLICATION } = process.env;

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
  trackGmail();
  trackFbLogin(app);

  /* USE_REPLICATION=true means we are using replicaset, so we can
   * use Collection.watch
   */
  if (USE_REPLICATION === 'true') {
    listenChangeConversation();
  }

  makeDirs();
};

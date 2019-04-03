import * as dotenv from 'dotenv';
import * as fs from 'fs';
import './cronJobs';
import { getEnv } from './data/utils';
import { listenChangeConversation } from './db/listener';
import { trackEngages } from './trackers/engageTracker';
import { trackFbLogin, trackIntegrations as trackFacebooks } from './trackers/facebookTracker';
import { trackGmail, trackGmailLogin } from './trackers/gmailTracker';
import { trackIntegrations as trackTwitters } from './trackers/twitterTracker';

dotenv.config();

const USE_REPLICATION = getEnv({ name: 'USE_REPLICATION', defaultValue: 'false' });

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

  /* USE_REPLICATION=true means we are using replicaset, so we can
   * use Collection.watch
   */
  if (USE_REPLICATION === 'true') {
    listenChangeConversation();
  }

  makeDirs();
};

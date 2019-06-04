import * as dotenv from 'dotenv';
import * as fs from 'fs';
import './cronJobs';
import { trackEngages } from './trackers/engageTracker';

dotenv.config();

export const init = async app => {
  const makeDirs = () => {
    const dir = `${__dirname}/private/xlsTemplateOutputs`;

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  };

  trackEngages(app);

  makeDirs();
};

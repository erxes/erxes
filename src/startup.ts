import * as fs from 'fs';

export const makeDirs = () => {
  const dir = `${__dirname}/private/xlsTemplateOutputs`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};

const init = async () => {
  makeDirs();
};

export default init;

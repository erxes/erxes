import * as fs from 'fs';

export const init = async () => {
  const makeDirs = () => {
    const dir = `${__dirname}/../private/xlsTemplateOutputs`;

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  };

  makeDirs();
};

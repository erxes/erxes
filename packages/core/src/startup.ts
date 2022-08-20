import * as fs from 'fs';
import * as fse from "fs-extra";
import { resolve } from 'path';
import { registerModule } from './data/permissions/utils';
import { debugBase } from './debuggers';

const filePath = pathName => {
  if (pathName) {
    return resolve(process.cwd(), pathName);
  }

  return resolve(process.cwd());
};

export const makeDirs = () => {
  const dir = `${__dirname}/private/xlsTemplateOutputs`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};

const init = async () => {
  makeDirs();

  const permissionsPath = filePath('permissions.json');

  debugBase('Permissions path ........', permissionsPath);

  if (fs.existsSync(permissionsPath)) {
    debugBase('Found permissions.json');

    const permissions = await fse.readJSON(filePath("permissions.json"));

    for (const permission of permissions) {
      await registerModule(permission);
    }
  }
};

export default init;
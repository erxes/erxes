import fse from 'fs-extra';
import fs from 'fs';
import { exec } from 'child_process';

const execute = async (func) => {
  try {
    await func();
  } catch (e: any) {
    console.log(e.message);
  }
}

const execCommand = command => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error !== null) {
        return reject(error);
      }

      console.log(stdout);
      console.log(stderr);

      return resolve('done');
    });
  });
};

const main = async () => {
  if (process.argv.length <= 2) {
    throw new Error('Please enter plugin name !!!');
  }

  const name = process.argv[2];
  const pluginName = `plugin-${name}-api`;

  await execute(() => fs.promises.mkdir('../../dist'));
  await execute(() => fse.copy('../api-plugin-template', '../../dist/api-plugin-template', { overwrite: true }));
  await execute(() => fse.copy('../api-utils', '../../dist/api-utils', { overwrite: true }));
  await execute(() => fse.copy(`../${pluginName}`, `../../dist/${pluginName}`, { overwrite: true }));

  console.log('Generating package.json ....')
  await execute(() => fs.promises.writeFile('../../dist/package.json', `
    {
      "name": "erxes",
      "private": true,
      "workspaces": ["*"]
    }
  `));

  process.chdir('../../dist');

  console.log('Yarn install ....')
  await execCommand('yarn install');

  process.chdir(pluginName);

  console.log('Yarn build ....')

  await execCommand('yarn build');

  console.log('Moving node_modules ....')
  await execute(() => fse.move('../node_modules', './.erxes/node_modules'));
};

main().then(() => {
  process.exit();
}).catch((e) => {
  console.log(e.message)
});
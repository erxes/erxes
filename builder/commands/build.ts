import * as fse from 'fs-extra';
import { exec } from 'child_process';

const execute = async func => {
  try {
    await func();
  } catch (e) {
    console.log(e.message);
  }
};

const execCommand = command => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      console.log(stdout);

      if (error !== null) {
        return reject(error);
      }

      console.log(stderr);

      return resolve('done');
    });
  });
};

const main = async () => {
  if (process.argv.length <= 2) {
    throw new Error(
      'Please pass the one of the following values gateway,core,plugin !!!'
    );
  }

  const type = process.argv[2];

  let folderName = type;

  if (type === 'plugin') {
    if (process.argv.length <= 3) {
      throw new Error('Please pass plugin name !!!');
    }

    folderName = `plugin-${process.argv[3]}-api`;
  }

  await execute(() =>
    fse.copy('../packages/api-utils', './api-utils', { overwrite: true })
  );

  if (type !== 'gateway') {
    await execute(() =>
      fse.copy('../packages/api-plugin-template', './api-plugin-template', {
        overwrite: true
      })
    );
  }

  await execute(() =>
    fse.copy(`../packages/${folderName}`, `./${folderName}`, {
      overwrite: true
    })
  );

  if (type === 'plugin') {
    console.log('replacing .erxes ...........');

    await execute(() =>
      fse.copy(
        '../packages/api-plugin-template.erxes',
        `./${folderName}/.erxes`,
        {
          overwrite: true
        }
      )
    );

    await execute(() =>
      fse.copy(
        `./${folderName}/Dockerfile`,
        `./${folderName}/.erxes/Dockerfile`,
        {
          overwrite: true
        }
      )
    );
  }

  // Even though this global yarn.lock contains all node_modules in packages folder
  // later when we are yarn install. it can compare package.json files in dist folders
  // and removing non existing modules from yarn.lock. Therefore it can only install nessecesary modules
  console.log('Replacing yarn.lock with global yarn.lock ...........');

  await execute(() =>
    fse.copy('../yarn.lock', `./yarn.lock`, {
      overwrite: true
    })
  );

  console.log('Yarn install ....');
  await execCommand('yarn install');

  process.chdir(folderName);

  console.log('Yarn build ....');

  if (type === 'gateway') {
    await execCommand('yarn tsc -p tsconfig.prod.json');
  } else {
    await execCommand('yarn build');
  }

  console.log('Removing node_modules with dev dependencies ....');
  process.chdir('..');
  await execCommand('rm -rf node_modules');
  console.log('Installing production deps ....');
  await execCommand('yarn install --production');

  console.log('Moving node_modules ....');

  if (type === 'plugin') {
    await execute(() =>
      fse.move('./node_modules', `./${folderName}/.erxes/dist/node_modules`)
    );
  } else {
    await execute(() =>
      fse.move('./node_modules', `./${folderName}/dist/node_modules`)
    );
  }
};

main()
  .then(() => process.exit())
  .catch(e => {
    console.log(e);
    process.exit(1);
  });

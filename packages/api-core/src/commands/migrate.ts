import * as fs from 'fs';
import * as path from 'path';
import * as shelljs from 'shelljs';

const main = async () => {
  const filePath = fileName => {
    return `${path.resolve(path.join(__dirname, '..', `${fileName}`))}`;
  };

  let node_modules = filePath('node_modules');

  if (!fs.existsSync(node_modules)) {
    node_modules = filePath('../node_modules');
  }

  const result = await shelljs.exec(
    `NODE_ENV=command ${node_modules}/migrate/bin/migrate --migrations-dir=${filePath(
      'migrations'
    )} --store=${filePath('db-migrate-store.js')} --force=true up`,
    {
      silent: true
    }
  );

  const output = result.stderr + result.stdout;

  console.log(output);

  process.exit();
};

main();

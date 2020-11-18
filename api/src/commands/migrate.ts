import * as path from 'path';
import * as shelljs from 'shelljs';

const main = async () => {
  const filePath = fileName => {
    return `${path.resolve(path.join(__dirname, '..', `${fileName}`))}`;
  };

  const result = await shelljs.exec(
    `NODE_ENV=command ${filePath(
      'node_modules'
    )}/migrate/bin/migrate --migrations-dir=${filePath(
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

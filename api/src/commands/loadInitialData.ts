import * as path from 'path';
import * as shelljs from 'shelljs';
import { getEnv } from '../data/utils';

const main = async () => {
  const MONGO_URL = getEnv({ name: 'MONGO_URL' });

  let type = 'permission';

  if (process.argv.slice(2).length > 0) {
    type = 'growthHack';
  }

  const result = await shelljs.exec(
    `mongorestore --uri ${MONGO_URL} --db erxes ${path.resolve(
      path.join(__dirname, '..', `initialData/${type}`)
    )}`,
    {
      silent: true
    }
  );

  const output = result.stderr + result.stdout;

  console.log(output);

  process.exit();
};

main();

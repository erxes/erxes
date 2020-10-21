import * as shelljs from 'shelljs';
import { getEnv } from '../data/utils';

const main = async () => {
  const MONGO_URL = getEnv({ name: 'MONGO_URL' });

  const result = await shelljs.exec(`mongorestore --uri ${MONGO_URL} --db erxes ./src/initialData/growthHack`, {
    silent: true,
  });
  const output = result.stderr + result.stdout;

  console.log(output);

  process.exit();
};

main();

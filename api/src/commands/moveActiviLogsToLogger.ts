import * as shelljs from 'shelljs';

const main = async () => {
  await shelljs.exec('mkdir dump');

  await shelljs.exec(
    'mongodump --db erxes --collection activity_logs --out dump'
  );

  await shelljs.exec(
    'mongorestore --db erxes_logs dump/erxes/activity_logs.bson'
  );

  await shelljs.exec('rm -rf dump');

  process.exit();
};

main();

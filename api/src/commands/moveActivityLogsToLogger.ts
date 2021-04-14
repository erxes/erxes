import * as shelljs from 'shelljs';

const main = async () => {
  const argv = process.argv;
  const { MONGO_URL } = process.env;

  const erxesDb = argv[2];
  const erxesLogDb = argv[3];

  await shelljs.exec('mkdir dump');

  await shelljs.exec(
    `mongodump --forceTableScan --uri "${MONGO_URL}" --collection activity_logs --out dump`
  );

  await shelljs.exec(`mv dump/${erxesDb} dump/${erxesLogDb}`);

  await shelljs.exec(`mongorestore --uri "${MONGO_URL}" dump`);

  await shelljs.exec('rm -rf dump');

  process.exit();
};

main();

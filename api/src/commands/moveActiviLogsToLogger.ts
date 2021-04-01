import * as shelljs from 'shelljs';

const main = async () => {
  const argv = process.argv;

  const uri = argv[2];
  const erxesDb = argv[3];
  const erxesLogDb = argv[4];

  await shelljs.exec('mkdir dump');

  await shelljs.exec(
    `mongodump --uri ${uri} --collection activity_logs --out dump`
  );

  await shelljs.exec(`mv dump/${erxesDb} dump/${erxesLogDb}`);

  await shelljs.exec(`mongorestore --uri ${uri} dump`);

  await shelljs.exec('rm -rf dump');

  process.exit();
};

main();

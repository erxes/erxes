const fse = require("fs-extra");
const start = require('./start');
const { filePath, log, execCommand } = require('./utils');
const { execSync } = require('child_process');

module.exports = async function() {
  try {
    log('Stopping pm2 processes ...');

    try {
      execSync("pm2 delete all", { stdio: 'inherit' });
    } catch (e) {
      console.log(e.message);
    }

    log('Backing up privite folder ...');
    await fse.copy(filePath('build/api/private'), filePath('private'));

    log('Dumping database ...');
    const configsJson = await fse.readJSON(filePath('configs.json'));
    await execCommand(`mongodump --uri ${configsJson.MONGO_URL}`);

    log('Removing old build ...');
    await fse.remove(filePath('build'));

    await start();

    log('Restoring privite folder ...');

    await fse.copy(filePath('private'), filePath('build/api/private'));
  } catch (e) {
    console.log(e);
  }
};

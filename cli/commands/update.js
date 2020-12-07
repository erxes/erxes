const fse = require("fs-extra");
const execa = require("execa");
const start = require('./start');
const { filePath, log } = require('./utils');

module.exports = async function() {
  try {
    log('Stopping pm2 processes ...');

    // stop services
    try {
      await execa("pm2", ["delete", 'all']);
    } catch (e) {
      console.log(e.message);
    }

    log('Backing up privite folder ...');

    await fse.copy(filePath('build/api/private'), filePath('private'));

    log('Removing old build ...');

    await fse.remove(filePath('build'));

    await start();

    log('Restoring privite folder ...');

    await fse.copy(filePath('private'), filePath('build/api/private'));
  } catch (e) {
    console.log(e);
  }
};

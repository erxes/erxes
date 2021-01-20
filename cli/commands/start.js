const fse = require('fs-extra');
const figlet = require('figlet');
const { filePath, downloadLatesVersion, startServices } = require('./utils');

module.exports = async function(program) {
  try {
    const configs = await fse.readJSON(filePath('configs.json'));

    if (!program || !program.ignoreDownload) {
      await downloadLatesVersion(configs);
    }

    // create configs file

    await startServices(configs);

    console.log(figlet.textSync('Welcome to Erxes'));
  } catch (e) {
    console.log(e);
  }
};

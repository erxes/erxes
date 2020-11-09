const fse = require("fs-extra");
const figlet = require('figlet');
const { filePath, downloadLatesVersion, startServices } = require('./utils');

module.exports = async function(program) {
  try {
    if (!program || !program.ignoreDownload) {
      // download the latest build
      await downloadLatesVersion();
    }

    // create configs file
    const configs = await fse.readJSON(filePath('configs.json'));

    await startServices(configs);

    console.log(figlet.textSync('Welcome to Erxes'));
  } catch (e) {
    console.log(e);
  }
};
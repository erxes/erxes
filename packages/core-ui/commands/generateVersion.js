const fs = require('fs');
const path = require('path');

const start = () => {
  const projectPath = process.cwd();
  const packageVersion = require(path.join(projectPath, '..', 'package.json')).version;
  const versionInfo = { packageVersion };

  fs.writeFile('./public/version.json', JSON.stringify(versionInfo), () => {
    console.log('saved');
  });
};

start();


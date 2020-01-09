const fs = require('fs');
const path = require('path');
const gitRepoInfo = require('git-repo-info');

const start = () => {
  const projectPath = process.cwd();
  const packageVersion = require(path.join(projectPath, 'package.json')).version;
  const info = gitRepoInfo();
  const versionInfo = { packageVersion, ...info };

  fs.writeFile('./public/version.json', JSON.stringify(versionInfo), () => {
    console.log('saved');
  });
};

start();
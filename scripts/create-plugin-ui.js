var { resolve } = require("path");
var fs = require('fs-extra');

const filePath = (pathName) => {
  if (pathName) {
    return resolve(__dirname, '..', pathName);
  }

  return resolve(__dirname, '..');
}

var main = async () => {
  fs.copySync(filePath('./packages/ui-plugin-template'), filePath(`./packages/plugin-${process.argv[2]}-ui`));
}

main();
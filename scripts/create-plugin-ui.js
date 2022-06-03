var { resolve } = require("path");
var fs = require('fs-extra');

const filePath = (pathName) => {
  if (pathName) {
    return resolve(__dirname, '..', pathName);
  }

  return resolve(__dirname, '..');
}

var main = async () => {
  const name = process.argv[2];

  fs.copySync(filePath('./packages/ui-plugin-template'), filePath(`./packages/plugin-${name}-ui`));

  const packageJSONBuffer = fs.readFileSync(filePath(`./packages/plugin-${name}-ui/package.json`));
  const packageContent = packageJSONBuffer.toString().replace(/_name_/gi, name);
  fs.writeFileSync(filePath(`./packages/plugin-${name}-ui/package.json`), packageContent);
}

main();
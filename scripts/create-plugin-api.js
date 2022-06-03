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

  fs.copySync(filePath('./packages/api-plugin-templ'), filePath(`./packages/plugin-${name}-api`));

  const packageJSONBuffer = fs.readFileSync(filePath(`./packages/plugin-${name}-api/package.json`));
  const packageContent = packageJSONBuffer.toString().replace(/_name_/gi, name);
  fs.writeFileSync(filePath(`./packages/plugin-${name}-api/package.json`), packageContent);

  const configsBuffer = fs.readFileSync(filePath(`./packages/plugin-${name}-api/src/configs.ts`));
  const configsContent = configsBuffer.toString().replace(/{name}/gi, name);
  fs.writeFileSync(filePath(`./packages/plugin-${name}-api/src/configs.ts`), configsContent);
}

main();
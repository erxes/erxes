var { resolve } = require("path");
var fs = require('fs-extra');

const filePath = (pathName) => {
  if (pathName) {
    return resolve(__dirname, '..', pathName);
  }

  return resolve(__dirname, '..');
}

const capitalizeFirstLetter = (value) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const replacer = (ft, name) => {
  const JSONBuffer = fs.readFileSync(filePath(`./packages/plugin-${name}-api/${ft}`));

  const content = JSONBuffer.toString()
    .replace(/_name_/gi, name)
    .replace(/{name}/g, name)
    .replace(/{Name}/g, capitalizeFirstLetter(name));

  fs.writeFileSync(filePath(`./packages/plugin-${name}-api/${ft}`), content);
}

var main = async () => {
  const name = process.argv[2];

  fs.copySync(filePath('./packages/api-plugin-templ'), filePath(`./packages/plugin-${name}-api`));

  replacer('package.json', name);
  replacer('src/configs.ts', name);
  replacer('src/models.ts', name);
  replacer('src/graphql/schema.ts', name);
  replacer('src/graphql/resolvers/mutations.ts', name);
  replacer('src/graphql/resolvers/queries.ts', name);
}

main();
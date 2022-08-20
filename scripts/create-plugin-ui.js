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
  const JSONBuffer = fs.readFileSync(filePath(`./packages/plugin-${name}-ui/${ft}`));

  const content = JSONBuffer.toString()
    .replace(/_name_/gi, name)
    .replace(/{name}/g, name)
    .replace(/{Name}/g, capitalizeFirstLetter(name));

  fs.writeFileSync(filePath(`./packages/plugin-${name}-ui/${ft}`), content);
}

var main = async () => {
  const name = process.argv[2];

  fs.copySync(filePath('./packages/ui-plugin-template'), filePath(`./packages/plugin-${name}-ui`));

  replacer('package.json', name);
  replacer('src/configs.js', name);
  replacer('src/routes.tsx', name);
  replacer('src/graphql/queries.ts', name);
  replacer('src/graphql/mutations.ts', name);
  replacer('src/containers/List.tsx', name);
  replacer('src/components/List.tsx', name);
}

main();
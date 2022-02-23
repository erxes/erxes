var deps = require('../package.json');
var fs = require("fs")

async function main() {
  var pluginName = deps.name.replace('@erxes', '');

  try {
    await fs.promises.copyFile('../src/graphql/subscriptionPlugin.js', `./dist/${pluginName}/src/graphql/subscriptionPlugin.js`);
  } catch (e) {
    console.log(e.message)
  }

  fs.rename(`./dist/${pluginName}`, './dist/main', function(err) {
    if (err) {
      console.log(err)
    }
  })
}

main().then(() => {
  process.exit();
})
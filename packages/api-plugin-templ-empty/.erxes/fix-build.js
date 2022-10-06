var deps = require('../package.json');
var fs = require("fs")
var path = require("path")

async function copyDir(src,dest) {
  try {
    const entries = await fs.promises.readdir(src, {withFileTypes: true});
    await fs.promises.mkdir(dest);
    for(let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if(entry.isDirectory()) {
            await copyDir(srcPath, destPath);
        } else {
            await fs.promises.copyFile(srcPath, destPath);
        }
    }
  } catch (e) {
    console.log(e);
  }
}
async function copyFile(src, dest) {
  try {
    await fs.promises.copyFile(src, dest);
  } catch (e) {
  }
}

async function main() {
  var pluginName = deps.name.replace('@erxes', '');

  await copyFile('../src/graphql/subscriptionPlugin.js', `./dist/${pluginName}/src/graphql/subscriptionPlugin.js`);
  await copyDir('../src/cronjobs', `./dist/${pluginName}/src/cronjobs`);
  await copyDir('../src/commands', `./dist/${pluginName}/src/commands`);

  fs.rename(`./dist/${pluginName}`, './dist/main', function(err) {
    if (err) {
      console.log(err)
    }
  })
}

main()
.then(() => {
  process.exit();
}).catch((e) => {
})
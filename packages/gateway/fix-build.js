var deps = require("../package.json");
var fs = require("fs");
var path = require("path");

async function copyDir(src, dest) {
  try {
    const entries = await fs.promises.readdir(src, { withFileTypes: true });
    await fs.promises.mkdir(dest);
    for (let entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        await copyDir(srcPath, destPath);
      } else {
        await fs.promises.copyFile(srcPath, destPath);
      }
    }
  } catch (e) {
    console.log(e);
  }
}
async function main() {
  await copyDir("./src/apollo-router/rhai", `./dist/gateway/src/apollo-router/rhai`);
}

main()
  .then(() => {
    process.exit();
  })
  .catch((e) => {});

var watchSync = require("watch-sync");
var { resolve } = require('path');

const filePath = pathName => {
  if (pathName) {
    return resolve(process.cwd(), pathName);
  }

  return resolve(process.cwd());
};

var srcDir = filePath("../src/");
var destDir = filePath("./plugin-src");
var options = {};
var watcher = watchSync(srcDir, destDir, options);

watcher.on("ready", function() { console.log("ready"); });

watcher.on("add", function(filepath, destDir, stat) {
  console.log("File / directory added", filepath, "in", destDir);
});

watcher.on("change", function(filepath, destDir, stat) {
  console.log("File / directory changed", filepath, "in", destDir);
});

watcher.on("delete", function(filepath, destDir) {
  console.log("File / directory removed", filepath, "from", destDir);
});
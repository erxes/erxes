var deps = require('../package.json');
var fs = require("fs")

var pluginName = deps.name.replace('@erxes', '');

fs.rename(`./dist/${pluginName}`, './dist/main', function(err) {
  if (err) {
    console.log(err)
  }
})
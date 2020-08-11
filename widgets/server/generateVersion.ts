import * as fs from "fs";
import * as gitRepoInfo from "git-repo-info";
import * as path from "path";

const start = () => {
  const projectPath = process.cwd();
  const packageVersion = require(path.join(projectPath, "package.json"))
    .version;
  const info = gitRepoInfo();
  const versionInfo = { packageVersion, ...info };

  fs.writeFile("./static/version.json", JSON.stringify(versionInfo), () => {
    console.log("saved");
  });
};

start();

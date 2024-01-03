const { execSync } = require("child_process");
const fs = require("fs");

const main = async () => {
  try {
    execSync("webpack --mode production", { stdio: "inherit" });
    fs.cpSync("public", "dist/", { force: true, recursive: true });
  } catch (e) {
    console.log(e.message);
  }
};

main();
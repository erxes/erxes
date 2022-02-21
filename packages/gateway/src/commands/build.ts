import fse from "fs-extra";
import fs from "fs";
import { exec } from "child_process";

const execute = async (func) => {
  try {
    await func();
  } catch (e) {
    console.log(e.message);
  }
};

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error !== null) {
        return reject(error);
      }

      console.log(stdout);
      console.log(stderr);

      return resolve("done");
    });
  });
};

const main = async () => {
  if (process.argv.length <= 2) {
    throw new Error(
      "Please pass the one of the following values gateway,api-core,plugin !!!"
    );
  }

  const type = process.argv[2];

  let folderName = type;

  if (type === "plugin") {
    if (process.argv.length <= 3) {
      throw new Error("Please pass plugin name !!!");
    }

    folderName = `plugin-${process.argv[3]}-api`;
  }

  await execute(() => fs.promises.rmdir("../../dist", { recursive: true }));
  await execute(() => fs.promises.mkdir("../../dist"));

  await execute(() =>
    fse.copy("../api-utils", "../../dist/api-utils", { overwrite: true })
  );

  if (type !== "gateway") {
    await execute(() =>
      fse.copy("../api-plugin-template", "../../dist/api-plugin-template", {
        overwrite: true,
      })
    );
  }

  await execute(() =>
    fse.copy(`../${folderName}`, `../../dist/${folderName}`, {
      overwrite: true,
    })
  );

  console.log("Generating package.json ....");
  await execute(() =>
    fs.promises.writeFile(
      "../../dist/package.json",
      `
    {
      "name": "erxes",
      "private": true,
      "workspaces": ["*"]
    }
  `
    )
  );

  process.chdir("../../dist");

  console.log("Yarn install ....");
  await execCommand("yarn install");

  process.chdir(folderName);

  console.log("Yarn build ....");

  await execCommand("yarn build");

  console.log("Moving node_modules ....");

  if (type === "plugin") {
    await execute(() => fse.move("../node_modules", "./.erxes/dist/node_modules"));
  } else {
    await execute(() => fse.move("../node_modules", "./dist/node_modules"));
  }
};

main()
  .then(() => {
    process.exit();
  })
  .catch((e) => {
    console.log(e.message);
  });
var fse = require("fs-extra");
var { exec } = require("child_process");

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
  await execCommand("webpack --mode production");

  await execute(() =>
    fse.copy("public", `dist/`, {
      overwrite: true,
    })
  );
};

main()
  .then(() => {
    process.exit();
  })
  .catch((e) => {
    console.log(e.message);
  });

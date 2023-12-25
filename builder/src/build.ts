import path from "path";
import fs from "fs";
import { execSync } from "child_process";

export default async function build(folderName: string) {
  const artifactDir = path.resolve(__dirname, "..", "erxes");
  const erxesDir = path.resolve(__dirname, "..", "..");
  const builderDir = path.resolve(__dirname, "..");

  const { version, dependencies } = JSON.parse(
    fs.readFileSync(`${erxesDir}/package.json`).toString()
  );

  fs.rmSync(artifactDir, { recursive: true, force: true });
  fs.mkdirSync(`${artifactDir}/packages`, { recursive: true });

  fs.cpSync(
    `${erxesDir}/packages/api-utils`,
    `${artifactDir}/packages/api-utils`,
    { recursive: true }
  );
  fs.cpSync(
    `${erxesDir}/packages/tsconfig.api.jsonc`,
    `${artifactDir}/packages/tsconfig.api.jsonc`
  );
  fs.cpSync(
    `${erxesDir}/packages/${folderName}`,
    `${artifactDir}/packages/${folderName}`,
    { recursive: true }
  );
  fs.cpSync(`${erxesDir}/yarn.lock`, `${artifactDir}/yarn.lock`);
  fs.writeFileSync(
    `${artifactDir}/package.json`,
    JSON.stringify(
      {
        name: `erxes`,
        private: true,
        version,
        workspaces: ["packages/*"],
        dependencies,
      },
      null,
      2
    )
  );

  process.chdir(artifactDir);
  execSync(`yarn install`, { stdio: "inherit" });

  execSync(`yarn workspaces run build`, { stdio: "inherit" });

  execSync(
    `cp -RT ${artifactDir}/packages/api-utils/dist ${artifactDir}/packages/api-utils/src`
  );
  execSync(
    `cp -RT ${artifactDir}/packages/${folderName}/dist ${artifactDir}/packages/${folderName}/src`
  );

  execSync(`rm -rf ${artifactDir}/node_modules`);
  execSync(`rm -rf ${artifactDir}/packages/api-utils/node_modules`);
  execSync(`rm -rf ${artifactDir}/packages/${folderName}/node_modules`);
  execSync(`rm -rf ${artifactDir}/packages/api-utils/dist`);
  execSync(`rm -rf ${artifactDir}/packages/${folderName}/dist`);

  execSync("yarn install --production", { stdio: "inherit" });
  process.chdir(builderDir);

  // if it has custom Dockerfile
  if (fs.existsSync(`${artifactDir}/packages/${folderName}/Dockerfile`)) {
    execSync(
      `cp ${erxesDir}/packages/${folderName}/Dockerfile ${artifactDir}/Dockerfile`
    );
  } // provide default Dockerfile
  else {
    const dockerfileTemplate = fs
      .readFileSync(`${erxesDir}/packages/default.template.Dockerfile`)
      .toString();
    const dockerfile = dockerfileTemplate.replace("${folderName}", folderName);
    fs.writeFileSync(`${artifactDir}/Dockerfile`, dockerfile);
  }

  // execSync(`find ${builderDir}/erxes -type f -name "*.ts" -delete`);
}

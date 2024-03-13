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

  fs.cpSync(`${artifactDir}/packages/api-utils/dist`, `${artifactDir}/packages/api-utils/src`, { recursive: true, force: false });
  fs.cpSync(`${artifactDir}/packages/${folderName}/dist`, `${artifactDir}/packages/${folderName}/src`, { recursive: true, force: false });

  fs.rmSync(`${artifactDir}/node_modules`, { recursive: true, force: true});
  fs.rmSync(`${artifactDir}/packages/api-utils/node_modules`, { recursive: true, force: true});
  fs.rmSync(`${artifactDir}/packages/${folderName}/node_modules`, { recursive: true, force: true});
  fs.rmSync(`${artifactDir}/packages/api-utils/dist`, { recursive: true, force: true});
  fs.rmSync(`${artifactDir}/packages/${folderName}/dist`, { recursive: true, force: true});

  execSync("yarn install --production", { stdio: "inherit" });
  process.chdir(builderDir);

  // if it has custom Dockerfile
  if (fs.existsSync(`${artifactDir}/packages/${folderName}/Dockerfile`)) {
    fs.cpSync(`${erxesDir}/packages/${folderName}/Dockerfile`, `${artifactDir}/Dockerfile`);
  } // else provide default Dockerfile
  else {
    const dockerfileTemplate = fs
      .readFileSync(`${erxesDir}/packages/default.template.Dockerfile`)
      .toString();
    const dockerfile = dockerfileTemplate.replace("${folderName}", folderName);
    fs.writeFileSync(`${artifactDir}/Dockerfile`, dockerfile);
  }
}

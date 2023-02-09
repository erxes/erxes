import * as path from 'path';
import * as fs from 'fs';
import { spawnSync } from 'child_process';

const dirTempPath = path.resolve(__dirname, 'temp');

if (!fs.existsSync(dirTempPath)) {
  fs.mkdirSync(dirTempPath, { recursive: true });
}
const routerPath = path.resolve(dirTempPath, 'router');

const main = async () => {
  if (fs.existsSync(routerPath)) {
    return;
  }
  const args = [
    '-c',
    `cd ${dirTempPath} && curl -sSL https://router.apollo.dev/download/nix/v1.10.2 | sh`
  ];
  spawnSync('sh', args, { stdio: 'inherit' });
};

main();

export default main;

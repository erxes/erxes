import { exec as execCb } from 'child_process';

import * as util from 'util';

const exec = util.promisify(execCb);

export default async function execAsyncWithStdio(command: string) {
  const promise = exec(command);
  const child = promise.child;

  child.stdout?.on('data', function(data) {
    console.log(data);
  });
  child.stderr?.on('data', function(data) {
    console.error(data);
  });
  await promise;
}

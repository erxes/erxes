import { SpawnOptions, spawn } from 'child_process';

export default function spawnAsync(
  command: string,
  args: ReadonlyArray<string>,
  options: SpawnOptions
): Promise<void> {
  return new Promise((resolve, reject) => {
    const cp = spawn(command, args, options);

    cp.on('error', (e: Error) => {
      reject(e);
    });

    cp.on('exit', (code: number | null) => {
      if (code === null || code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with ${code}`));
      }
    });
  });
}

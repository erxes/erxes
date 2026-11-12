import { closeDb } from '@erxes/core-db';

const fail = (error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
};

/** Runs a command, prints its failure to stderr with exit code 1, and closes the pool. */
export const runCli = (main: () => Promise<void>) => {
  main()
    .catch(fail)
    .then(() => closeDb())
    .catch(fail);
};

/** One line to stdout. */
export const say = (line: string) => {
  process.stdout.write(`${line}\n`);
};

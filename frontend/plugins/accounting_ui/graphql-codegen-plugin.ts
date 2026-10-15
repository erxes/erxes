import { execFile } from 'node:child_process';
import { dirname, extname, join, relative, sep } from 'node:path';
import { promisify } from 'node:util';
import type { Compiler } from '@rspack/core';

const runFile = promisify(execFile);

export class AccountingGraphqlCodegenPlugin {
  apply(compiler: Compiler): void {
    let preparation: Promise<void> | undefined;
    let preparedChanges: ReadonlySet<string> | undefined;
    let preparedRemovals: ReadonlySet<string> | undefined;
    const prepare = (): Promise<void> => {
      const changes = compiler.modifiedFiles;
      const removals = compiler.removedFiles;
      const sourceChanged =
        (changes !== preparedChanges || removals !== preparedRemovals) &&
        [...(changes ?? []), ...(removals ?? [])].some((file) => {
          const localPath = relative(__dirname, file);
          return (
            localPath.startsWith(`src${sep}`) &&
            !localPath.startsWith(`src${sep}gql${sep}`) &&
            ['.ts', '.tsx'].includes(extname(file))
          );
        });
      if (!preparation || sourceChanged) {
        preparedChanges = changes;
        preparedRemovals = removals;
        preparation = this.generate();
      }
      return preparation;
    };

    // Module Federation starts remotes via runExecutor, bypassing Nx dependsOn.
    compiler.hooks.beforeRun.tapPromise('AccountingGraphqlCodegen', prepare);
    compiler.hooks.watchRun.tapPromise('AccountingGraphqlCodegen', prepare);
  }

  private async generate(): Promise<void> {
    await runFile(
      'pnpm',
      ['nx', 'run', 'gateway:schema:compose', '--parallel=2'],
      { cwd: join(__dirname, '../../..') },
    );

    const cliRoot = dirname(
      require.resolve('@graphql-codegen/cli/package.json'),
    );
    await runFile(
      process.execPath,
      [join(cliRoot, 'esm/bin.js'), '--config', 'codegen.ts'],
      {
        cwd: __dirname,
      },
    );
  }
}

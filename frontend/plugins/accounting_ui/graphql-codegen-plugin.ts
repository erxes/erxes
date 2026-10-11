import { execFile } from 'node:child_process';
import { dirname, join } from 'node:path';
import { promisify } from 'node:util';
import type { Compiler } from '@rspack/core';

const runFile = promisify(execFile);

export class AccountingGraphqlCodegenPlugin {
  apply(compiler: Compiler): void {
    let preparation: Promise<void> | undefined;
    const prepare = (): Promise<void> => {
      preparation ??= this.generate();
      return preparation;
    };

    // Module Federation starts remotes via runExecutor, bypassing Nx dependsOn.
    compiler.hooks.beforeRun.tapPromise('AccountingGraphqlCodegen', prepare);
    compiler.hooks.watchRun.tapPromise('AccountingGraphqlCodegen', prepare);
  }

  private async generate(): Promise<void> {
    const backendRoot = join(
      __dirname,
      '../../../backend/plugins/accounting_api',
    );
    await runFile('pnpm', ['schema:print'], { cwd: backendRoot });

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

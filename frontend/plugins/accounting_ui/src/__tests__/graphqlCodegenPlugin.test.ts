import { execFile } from 'node:child_process';
import { resolve } from 'node:path';
import type { Compiler } from '@rspack/core';
import { AccountingGraphqlCodegenPlugin } from '../../graphql-codegen-plugin';

jest.mock('node:child_process', () => ({
  execFile: jest.fn(),
}));

const setup = () => {
  const beforeRun = { tapPromise: jest.fn() };
  const watchRun = { tapPromise: jest.fn() };
  const compiler = { hooks: { beforeRun, watchRun } } as unknown as Compiler;
  new AccountingGraphqlCodegenPlugin().apply(compiler);
  const prepareBuild: () => Promise<void> =
    beforeRun.tapPromise.mock.calls[0][1];
  const prepareWatch: () => Promise<void> =
    watchRun.tapPromise.mock.calls[0][1];
  return { compiler, prepareBuild, prepareWatch };
};

beforeEach(() => {
  jest.mocked(execFile).mockReset();
  jest.mocked(execFile).mockImplementation((...args: unknown[]) => {
    const callback = args[args.length - 1];
    if (typeof callback === 'function') callback(null, '', '');
    return {} as ReturnType<typeof execFile>;
  });
});

test('exports schema before codegen and shares preparation across compiler hooks', async () => {
  const { prepareBuild, prepareWatch } = setup();
  expect(execFile).not.toHaveBeenCalled();
  await Promise.all([prepareBuild(), prepareWatch(), prepareWatch()]);
  expect(execFile).toHaveBeenCalledTimes(2);
  expect(jest.mocked(execFile).mock.calls[0]).toEqual([
    'pnpm',
    ['nx', 'run', 'gateway:schema:compose', '--parallel=2'],
    expect.objectContaining({
      cwd: resolve(__dirname, '../../../../..'),
    }),
    expect.any(Function),
  ]);
  expect(jest.mocked(execFile).mock.calls[1]).toEqual([
    process.execPath,
    [expect.stringContaining('esm/bin.js'), '--config', 'codegen.ts'],
    expect.objectContaining({
      cwd: expect.stringContaining('frontend/plugins/accounting_ui'),
    }),
    expect.any(Function),
  ]);
});

test('schema export failure prevents codegen and compilation', async () => {
  jest.mocked(execFile).mockImplementation((...args: unknown[]) => {
    const callback = args[args.length - 1];
    if (typeof callback === 'function')
      callback(new Error('Schema export failed'), '', '');
    return {} as ReturnType<typeof execFile>;
  });
  const { prepareWatch } = setup();
  await expect(prepareWatch()).rejects.toThrow('Schema export failed');
  expect(execFile).toHaveBeenCalledTimes(1);
});

test('watch source changes regenerate documents but generated files do not cause a loop', async () => {
  const { compiler, prepareWatch } = setup();
  await prepareWatch();
  expect(execFile).toHaveBeenCalledTimes(2);
  compiler.modifiedFiles = new Set([
    resolve(__dirname, '../modules/transactions/graphql/transactionQueries.ts'),
  ]);
  await prepareWatch();
  expect(execFile).toHaveBeenCalledTimes(4);
  await prepareWatch();
  expect(execFile).toHaveBeenCalledTimes(4);
  compiler.modifiedFiles = new Set([resolve(__dirname, '../gql/gql.ts')]);
  await prepareWatch();
  expect(execFile).toHaveBeenCalledTimes(4);
  compiler.removedFiles = new Set([
    resolve(__dirname, '../modules/transactions/graphql/transactionQueries.ts'),
  ]);
  await prepareWatch();
  expect(execFile).toHaveBeenCalledTimes(6);
});

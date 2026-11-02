import { sendWorkerQueue } from 'erxes-api-shared/utils';
import type { IContext } from '~/connectionResolvers';
import { exportMutations } from '../export';

jest.mock('erxes-api-shared/utils', () => ({
  sendWorkerQueue: jest.fn(),
}));

jest.mock('erxes-api-shared/core-modules', () => ({
  splitType: jest.fn(),
  getImportExportJobOptions: jest.fn(() => ({})),
}));

jest.mock('~/modules/import-export/utils/validateConfig', () => ({
  validateExportConfig: jest.fn(),
}));

jest.mock('~/modules/import-export/utils/getRequiredPermissions', () => ({
  checkImportExportPermissions: jest.fn(),
  getRequiredImportExportPermissions: jest.fn(),
}));

const add = jest.fn(async () => ({ id: 'job-1' }));

const buildContext = (exportDoc: Record<string, unknown>) => {
  const getExport = jest.fn(async () => exportDoc);
  const updateOne = jest.fn(async () => ({}));

  const context = {
    models: { Exports: { getExport, updateOne } },
    subdomain: 'test',
    user: { _id: 'user-1' },
    checkPermission: jest.fn(),
  } as unknown as IContext;

  return { context, updateOne };
};

const failedExport = {
  _id: 'export-1',
  userId: 'user-1',
  status: 'failed',
  pluginName: 'core',
  entityType: 'core:contacts.customer',
};

describe('exportRetry', () => {
  beforeEach(() => {
    add.mockClear();
    jest.mocked(sendWorkerQueue).mockReturnValue({ add } as never);
  });

  it('restarts a failed export that saved no cursor', async () => {
    const { context, updateOne } = buildContext(failedExport);

    await exportMutations.exportRetry(
      undefined,
      { exportId: 'export-1' },
      context,
    );

    expect(updateOne).toHaveBeenCalledWith(
      { _id: 'export-1' },
      {
        $set: { status: 'pending', processedRows: 0 },
        $unset: { errorMessage: '', terminalError: '', lastCursor: '' },
      },
    );
    expect(add).toHaveBeenCalledWith(
      'processExport',
      {
        subdomain: 'test',
        data: { exportId: 'export-1', entityType: 'core:contacts.customer' },
      },
      expect.any(Object),
    );
  });

  it('refuses an export that has not failed', async () => {
    const { context } = buildContext({ ...failedExport, status: 'completed' });

    await expect(
      exportMutations.exportRetry(undefined, { exportId: 'export-1' }, context),
    ).rejects.toThrow('Can only retry failed exports');
    expect(add).not.toHaveBeenCalled();
  });
});

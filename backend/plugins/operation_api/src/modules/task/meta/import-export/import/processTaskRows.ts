import { IModels } from '~/connectionResolvers';
import { prepareTaskDoc } from './prepareTaskDoc';
import { ITaskImportRow } from '../../../@types/task';

export async function processTaskRows(
  models: IModels,
  rows: ITaskImportRow[],
  userId: string,
  subdomain: string,
): Promise<{
  successRows: Array<ITaskImportRow & { _id: string }>;
  errorRows: Array<ITaskImportRow & { error: string }>;
}> {
  const successRows: Array<ITaskImportRow & { _id: string }> = [];
  const errorRows: Array<ITaskImportRow & { error: string }> = [];

  for (const row of rows) {
    try {
      const doc = await prepareTaskDoc(models, row, subdomain);

      const created = await models.Task.createTask({
        doc,
        userId,
        subdomain,
      });

      successRows.push({ ...row, _id: created._id });
    } catch (e: unknown) {
      errorRows.push({ ...row, error: e instanceof Error ? e.message : 'Failed to import row' });
    }
  }

  return { successRows, errorRows };
}

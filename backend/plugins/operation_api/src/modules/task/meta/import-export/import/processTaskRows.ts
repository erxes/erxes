import { IModels } from '~/connectionResolvers';
import { prepareTaskDoc } from './prepareTaskDoc';

export async function processTaskRows(
  models: IModels,
  rows: any[],
  userId: string,
  subdomain: string,
): Promise<{ successRows: any[]; errorRows: any[] }> {
  const successRows: any[] = [];
  const errorRows: any[] = [];

  for (const row of rows) {
    try {
      const doc = await prepareTaskDoc(models, row, subdomain);

      const created = await models.Task.createTask({
        doc,
        userId,
        subdomain,
      });

      successRows.push({ ...row, _id: created._id });
    } catch (e: any) {
      errorRows.push({ ...row, error: e?.message || 'Failed to import row' });
    }
  }

  return { successRows, errorRows };
}

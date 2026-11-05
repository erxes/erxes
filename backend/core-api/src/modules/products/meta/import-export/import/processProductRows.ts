import { IProduct } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { resolveImportTagIdsByName } from '~/meta/import-export/utils';
import { parseProductRow, ProductImportRow } from './utils';

type ProductErrorRow = ProductImportRow & { error: string };
type ProductSuccessRow = ProductImportRow & { _id: string };

export async function processProductRows(
  models: IModels,
  rows: ProductImportRow[],
): Promise<{ successRows: ProductSuccessRow[]; errorRows: ProductErrorRow[] }> {
  const successRows: ProductSuccessRow[] = [];
  const errorRows: ProductErrorRow[] = [];

  try {
    const tagIdsByName = await resolveImportTagIdsByName(
      models,
      'core:product',
      rows.map((row) => row.tags),
    );

    const parsed: Array<{ row: ProductImportRow; doc: Partial<IProduct> }> = [];

    for (const row of rows) {
      try {
        parsed.push({ row, doc: parseProductRow(row, tagIdsByName) });
      } catch (e) {
        errorRows.push({ ...row, error: (e as Error).message });
      }
    }

    const results = await models.Products.upsertProductsByCode(
      parsed.map(({ doc }) => doc),
    );

    results.forEach(({ _id, error }, index) => {
      const { row } = parsed[index];

      if (_id) {
        successRows.push({ ...row, _id });
      } else {
        errorRows.push({ ...row, error: error || 'Failed to save row' });
      }
    });

    return { successRows, errorRows };
  } catch (e) {
    return {
      successRows: [],
      errorRows: rows.map((row) => ({
        ...row,
        error: (e as Error)?.message || 'Failed to process rows',
      })),
    };
  }
}

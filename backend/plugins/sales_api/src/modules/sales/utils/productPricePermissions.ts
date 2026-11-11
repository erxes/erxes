import { IProductData } from '~/modules/sales/@types';

const PRICE_TOLERANCE = 1e-6;

type TCheckPermission = (action: string) => Promise<void>;

type TProductRow = Partial<IProductData>;

const toRows = (rows: unknown): TProductRow[] =>
  Array.isArray(rows)
    ? rows.filter(
        (row): row is TProductRow =>
          typeof row === 'object' && row !== null && !Array.isArray(row),
      )
    : [];

const savedRowsById = (rows: unknown) =>
  new Map(
    toRows(rows)
      .filter((row): row is TProductRow & { _id: string } => !!row._id)
      .map((row) => [row._id, row]),
  );

const changesUnitPrices = (rows: unknown, savedRows: unknown) => {
  const saved = savedRowsById(savedRows);

  return toRows(rows).some((row) => {
    const previous = row._id ? saved.get(row._id) : undefined;

    return (
      !!previous &&
      Math.abs(Number(row.unitPrice ?? 0) - Number(previous.unitPrice ?? 0)) >
        PRICE_TOLERANCE
    );
  });
};

const removesProducts = (rows: unknown, savedRows: unknown) => {
  const keptIds = new Set(
    toRows(rows)
      .map((row) => row._id)
      .filter(Boolean),
  );

  return toRows(savedRows).some((row) => row._id && !keptIds.has(row._id));
};

export const checkProductRowPermissions = async (
  checkPermission: TCheckPermission,
  rows: unknown,
  savedRows: unknown,
) => {
  if (changesUnitPrices(rows, savedRows)) {
    await checkPermission('dealsProductsEdit');
  }

  if (removesProducts(rows, savedRows)) {
    await checkPermission('dealsProductsDelete');
  }
};

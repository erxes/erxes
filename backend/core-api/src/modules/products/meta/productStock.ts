import { IModels } from '~/connectionResolvers';

type TInventoryEntry = { remainder?: number };
type TStockedProduct = {
  _id: string;
  name?: string;
  code?: string;
  unitPrice?: number;
  currency?: string;
  uom?: string;
  inventories?: Record<string, Record<string, TInventoryEntry>>;
};

// The key a branch-less or department-less inventory is stored under
const NO_SCOPE = '_';

/**
 * A product as a customer may hear about it: price and stock now, by branch
 * name. Cost never leaves. A product without any inventory entry has no
 * stock tracking, which is not the same as being sold out.
 */
export const toProductStockView = async (
  models: IModels,
  product: TStockedProduct,
) => {
  const byBranch = new Map<string, number>();

  for (const [branchId, departments] of Object.entries(
    product.inventories || {},
  )) {
    for (const entry of Object.values(departments || {})) {
      byBranch.set(
        branchId,
        (byBranch.get(branchId) || 0) + (Number(entry?.remainder) || 0),
      );
    }
  }

  const branchIds = [...byBranch.keys()].filter((id) => id !== NO_SCOPE);
  const branches = branchIds.length
    ? await models.Branches.find(
        { _id: { $in: branchIds } },
        { title: 1 },
      ).lean()
    : [];
  const titleById = new Map(
    branches.map((branch) => [String(branch._id), branch.title || '']),
  );

  return {
    _id: product._id,
    name: product.name,
    code: product.code,
    unitPrice: product.unitPrice,
    currency: product.currency,
    uom: product.uom,
    stockTracked: byBranch.size > 0,
    remainder: [...byBranch.values()].reduce((sum, value) => sum + value, 0),
    branches: [...byBranch.entries()]
      .filter(([branchId]) => branchId !== NO_SCOPE)
      .map(([branchId, remainder]) => ({
        name: titleById.get(branchId) || '',
        remainder,
      })),
  };
};

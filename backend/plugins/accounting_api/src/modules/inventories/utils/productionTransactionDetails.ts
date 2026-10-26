import { ITrDetail } from '../../accounting/@types/transaction';

export const matchProductionDetailIds = (
  details: ITrDetail[],
  previous: ITrDetail[] = [],
): ITrDetail[] => {
  const used = new Set<string>();
  return details.map((detail) => {
    const old = previous.find(
      (row) =>
        row._id &&
        !used.has(row._id) &&
        row.accountId === detail.accountId &&
        row.productId === detail.productId,
    );
    if (old?._id) used.add(old._id);
    return { ...detail, _id: old?._id || detail._id };
  });
};

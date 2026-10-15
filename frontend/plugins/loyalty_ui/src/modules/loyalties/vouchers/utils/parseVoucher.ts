import { isRecord } from '@/loyalties/utils/isRecord';
import {
  IVoucher,
  IVoucherHistoryEntry,
  IVoucherTerms,
  TVoucherRow,
} from '../types/voucher';

const text = (value: unknown) =>
  typeof value === 'string' ? value : undefined;

const number = (value: unknown) =>
  typeof value === 'number' ? value : undefined;

const texts = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];

const parseTerms = (value: unknown): IVoucherTerms | null => {
  if (!isRecord(value)) {
    return null;
  }

  const restrictions = isRecord(value.restrictions)
    ? value.restrictions
    : undefined;

  return {
    title: text(value.title),
    voucherType: text(value.voucherType),
    kind: text(value.kind),
    value: number(value.value),
    restrictions: restrictions && {
      minimumSpend: number(restrictions.minimumSpend),
      maximumSpend: number(restrictions.maximumSpend),
      categoryIds: texts(restrictions.categoryIds),
      excludeCategoryIds: texts(restrictions.excludeCategoryIds),
      productIds: texts(restrictions.productIds),
      excludeProductIds: texts(restrictions.excludeProductIds),
      tag: texts(restrictions.tag),
      orExcludeTag: texts(restrictions.orExcludeTag),
    },
    bonusProductId: text(value.bonusProductId),
    bonusCount: number(value.bonusCount),
  };
};

const parseHistory = (value: unknown): IVoucherHistoryEntry[] =>
  Array.isArray(value)
    ? value.flatMap((entry) => {
        if (!isRecord(entry)) {
          return [];
        }

        const action = text(entry.action);
        const at = text(entry.at);

        return action && at
          ? [
              {
                action,
                at,
                by: text(entry.by),
                targetType: text(entry.targetType),
                targetId: text(entry.targetId),
                note: text(entry.note),
              },
            ]
          : [];
      })
    : [];

export const toVoucher = (row: TVoucherRow): IVoucher => ({
  ...row,
  terms: parseTerms(row.terms),
  usedIn: isRecord(row.usedIn)
    ? {
        targetType: text(row.usedIn.targetType),
        targetId: text(row.usedIn.targetId),
        note: text(row.usedIn.note),
      }
    : null,
  createdVia: isRecord(row.createdVia)
    ? {
        source: text(row.createdVia.source),
        sourceName: text(row.createdVia.sourceName),
      }
    : null,
  history: parseHistory(row.history),
});

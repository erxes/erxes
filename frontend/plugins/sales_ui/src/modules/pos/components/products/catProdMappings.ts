import { isDefined } from 'erxes-ui';
import type { CatProd } from '@/pos/pos-detail/types/IPos';
import type { IPos } from '@/pos/types/pos';

export type CatProdMappingDraft = {
  posId?: string;
  mappingId?: string;
};

export const toCatProdMappings = (
  mappings: IPos['catProdMappings'] | undefined,
): CatProd[] =>
  (mappings ?? []).filter(isDefined).map((mapping) => ({
    _id: mapping._id ?? '',
    categoryId: mapping.categoryId ?? '',
    productId: mapping.productId ?? '',
    code: mapping.code ?? undefined,
    name: mapping.name ?? undefined,
  }));

export const toCatProdMappingsInput = (mappings: CatProd[]) =>
  mappings.map((mapping) => ({
    _id: mapping._id,
    categoryId: mapping.categoryId,
    code: mapping.code || '',
    name: mapping.name || '',
    productId: mapping.productId,
  }));

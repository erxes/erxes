import { sendTRPCMessage } from 'erxes-api-shared/utils';
import type { IProductGroup } from '../@types/pos';

const categoryChildren = async (
  subdomain: string,
  ids: string[] = [],
): Promise<string[]> => {
  if (!ids.length) return [];
  const categories: { _id: string }[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'productCategories',
    action: 'withChilds',
    input: { ids },
    throwOnError: true,
  });
  return [...new Set([...ids, ...categories.map(({ _id }) => _id)])];
};

const tagChildren = async (
  subdomain: string,
  ids: string[] = [],
): Promise<string[]> => {
  if (!ids.length) return [];
  const tags: { _id: string }[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'tags',
    action: 'findWithChild',
    input: { query: { _id: { $in: ids } }, fields: { _id: 1 } },
    throwOnError: true,
  });
  return [...new Set([...ids, ...tags.map(({ _id }) => _id)])];
};

type ProductGroupFilter = Pick<
  IProductGroup,
  | 'categoryIds'
  | 'excludedCategoryIds'
  | 'excludedProductIds'
  | 'productIds'
  | 'tagIds'
  | 'excludeTagIds'
>;

export const getProductGroupSelection = async (
  subdomain: string,
  group: ProductGroupFilter,
): Promise<{
  query: Record<string, unknown>;
  categoryIds: string[];
}> => {
  const [categories, excludedCategories, tags, excludedTags] =
    await Promise.all([
      categoryChildren(subdomain, group.categoryIds),
      categoryChildren(subdomain, group.excludedCategoryIds),
      tagChildren(subdomain, group.tagIds),
      tagChildren(subdomain, group.excludeTagIds),
    ]);
  const includes: Record<string, unknown>[] = [];
  if (categories.length) includes.push({ categoryId: { $in: categories } });
  if (tags.length) includes.push({ tagIds: { $in: tags } });
  if (group.productIds?.length)
    includes.push({ _id: { $in: group.productIds } });

  const excludedCategoryIds = new Set(excludedCategories);
  return {
    categoryIds: categories.filter((id) => !excludedCategoryIds.has(id)),
    query: {
      status: { $ne: 'deleted' },
      $and: [
        includes.length ? { $or: includes } : { _id: { $in: [] } },
        { categoryId: { $nin: excludedCategories } },
        { tagIds: { $nin: excludedTags } },
        { _id: { $nin: group.excludedProductIds || [] } },
      ],
    },
  };
};

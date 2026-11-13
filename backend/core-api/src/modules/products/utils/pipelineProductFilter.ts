import type { FilterQuery } from 'mongoose';
import type { IProductDocument } from 'erxes-api-shared/core-types';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { getPipelineInventoryScope } from '../graphql/resolvers/customResolvers/product';
import type { IContext, IModels } from '~/connectionResolvers';

type PipelineProductScope = {
  initialCategoryIds?: string[];
  excludeCategoryIds?: string[];
  excludeProductIds?: string[];
  productIds?: string[];
  tagIds?: string[];
  excludeTagIds?: string[];
};

const expandTagIds = async (
  models: Pick<IModels, 'Tags'>,
  ids: string[],
): Promise<string[]> => {
  if (!ids.length) return [];
  const tags = await models.Tags.find({ _id: { $in: ids } }).lean();
  const orders = tags
    .map(({ order }) => order)
    .filter((order): order is string => !!order);
  const children = orders.length
    ? await models.Tags.find(
        {
          $or: orders.map((order) => ({
            order: { $regex: `^${escapeRegExp(order)}` },
          })),
        },
        { _id: 1 },
      ).lean()
    : [];
  return [...new Set([...ids, ...children.map(({ _id }) => _id)])];
};

type ProductSelection = {
  conditions: FilterQuery<IProductDocument>[];
  categoryIds: string[];
};
type ProductSelectionModels = Pick<IModels, 'Tags' | 'ProductCategories'>;

const expandCategoryIds = async (
  models: ProductSelectionModels,
  ids: string[],
): Promise<string[]> => {
  if (!ids.length) return [];
  const categories = await models.ProductCategories.getChildCategories(ids);
  return [...new Set([...ids, ...categories.map(({ _id }) => _id)])];
};

export const getPipelineProductSelection = async (
  models: ProductSelectionModels,
  pipeline: PipelineProductScope = {},
): Promise<ProductSelection> => {
  const [categories, excludedCategories, tags, excludedTags] =
    await Promise.all([
      expandCategoryIds(models, pipeline.initialCategoryIds || []),
      expandCategoryIds(models, pipeline.excludeCategoryIds || []),
      expandTagIds(models, pipeline.tagIds || []),
      expandTagIds(models, pipeline.excludeTagIds || []),
    ]);
  const includes: FilterQuery<IProductDocument>[] = [];
  if (categories.length) includes.push({ categoryId: { $in: categories } });
  if (tags.length) includes.push({ tagIds: { $in: tags } });
  if (pipeline.productIds?.length)
    includes.push({ _id: { $in: pipeline.productIds } });
  const conditions: FilterQuery<IProductDocument>[] = [];
  const hasIncludes = !!(
    pipeline.initialCategoryIds?.length ||
    pipeline.tagIds?.length ||
    pipeline.productIds?.length
  );
  if (hasIncludes) {
    conditions.push(includes.length ? { $or: includes } : { _id: { $in: [] } });
  }
  if (excludedCategories.length)
    conditions.push({ categoryId: { $nin: excludedCategories } });
  if (excludedTags.length) conditions.push({ tagIds: { $nin: excludedTags } });
  if (pipeline.excludeProductIds?.length)
    conditions.push({ _id: { $nin: pipeline.excludeProductIds } });
  return { conditions, categoryIds: categories };
};

const selectionByRequest = new WeakMap<
  IContext,
  Map<string, Promise<ProductSelection>>
>();

export const getPipelineProductSelectionForRequest = (
  context: IContext,
  pipelineId: string,
): Promise<ProductSelection> => {
  let selections = selectionByRequest.get(context);
  if (!selections) {
    selections = new Map();
    selectionByRequest.set(context, selections);
  }
  let selection = selections.get(pipelineId);
  if (!selection) {
    selection = getPipelineInventoryScope(context, pipelineId).then(
      (pipeline) => getPipelineProductSelection(context.models, pipeline),
    );
    selections.set(pipelineId, selection);
  }
  return selection;
};

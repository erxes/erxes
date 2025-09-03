import { ITagFilterQueryParams } from '@/tags/@types/tag';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';

const generateFilter = async ({ params, commonQuerySelector, models }) => {
  const { searchValue, parentId, ids, excludeIds, isGroup } = params;

  const filter: FilterQuery<ITagFilterQueryParams> = { ...commonQuerySelector };

  if (searchValue) {
    filter.name = new RegExp(`.*${searchValue}.*`, 'i');
  }

  if (ids?.length) {
    filter._id = { [excludeIds ? '$nin' : '$in']: ids };
  }

  if (isGroup) {
    filter.isGroup = isGroup;
  }

  if (parentId) {
    const parentTag = await models.Tags.find({ parentId }).distinct('_id');

    let ids = [parentId, ...parentTag];

    const getChildTags = async (parentTagIds: string[]) => {
      const childTag = await models.Tags.find({
        parentId: { $in: parentTagIds },
      }).distinct('_id');

      if (childTag.length > 0) {
        ids = [...ids, ...childTag];
        await getChildTags(childTag);
      }
    };

    await getChildTags(parentTag);

    filter._id = { $in: ids };
  }

  return filter;
};

export const tagQueries = {
  /**
   * Get tags
   */
  async tags(
    _parent: undefined,
    params: ITagFilterQueryParams,
    { models, commonQuerySelector }: IContext,
  ) {
    const filter = await generateFilter({
      params,
      commonQuerySelector,
      models,
    });

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.Tags,
      params,
      query: filter,
    });

    return { list, totalCount, pageInfo };
  },

  async tagsQueryCount(
    _parent: undefined,
    {
      type,
      searchValue,
    }: {
      type: string;
      searchValue?: string;
    },
    { models, commonQuerySelector }: IContext,
  ) {
    const selector: any = { ...commonQuerySelector };

    if (type) {
      selector.type = type;
    }

    if (searchValue) {
      selector.name = new RegExp(`.*${searchValue}.*`, 'i');
    }

    return models.Tags.countDocuments(selector);
  },

  async tagDetail(
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.Tags.getTag(_id);
  },
};

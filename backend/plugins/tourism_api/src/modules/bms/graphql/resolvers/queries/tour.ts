import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import {
  ITourDocument,
  TourFilterParams,
  TourListResponse,
} from '@/bms/@types/tour';
import { Resolver } from 'erxes-api-shared/core-types';

function buildDateSelector(
  selector: Record<string, any>,
  field: 'startDate' | 'endDate',
  date1?: Date,
  date2?: Date,
) {
  if (date1 || date2) {
    if (!selector[field]) {
      selector[field] = {};
    }
    if (date1) {
      selector[field]['$gte'] = date1;
    }
    if (date2) {
      selector[field]['$lte'] = date2;
    }
  }
}

async function buildSubCategoryIds(
  models: IContext['models'],
  categories?: string[],
) {
  if (!categories?.length) {
    return [];
  }

  let allSubcategories: string[] = [...categories];
  let ids: string[] = [...categories];

  while (ids.length > 0) {
    const newIds = (
      await models.BmsTourCategories.find({ parentId: { $in: ids } })
    ).map((x) => x._id);

    allSubcategories = [...newIds, ...allSubcategories];
    ids = newIds;
  }

  return allSubcategories;
}

const applyCategoryFilters = (
  selector: Record<string, any>,
  tags?: string[],
  categoryId?: string,
) => {
  const andConditions: any[] = [];

  if (tags?.length) {
    andConditions.push({
      $or: [{ tagIds: { $in: tags } }, { categoryIds: { $in: tags } }],
    });
  }

  if (categoryId) {
    andConditions.push({
      $or: [
        { categoryId },
        { tagIds: { $in: [categoryId] } },
        { categoryIds: { $in: [categoryId] } },
      ],
    });
  }

  if (andConditions.length === 1) {
    Object.assign(selector, andConditions[0]);
  }

  if (andConditions.length > 1) {
    selector.$and = andConditions;
  }
};

const tourQueries: Record<string, Resolver> = {
  async bmsTours(
    _root: any,
    {
      categories,
      tags,
      categoryId,
      name,
      status,
      innerDate,
      branchId,
      startDate1,
      endDate1,
      startDate2,
      endDate2,
      date_status,
      ...params
    }: TourFilterParams,
    { models }: IContext,
  ): Promise<TourListResponse> {
    const selector: Record<string, any> = {};

    const expandedCategoryIds = await buildSubCategoryIds(models, categories);

    if (expandedCategoryIds.length) {
      selector.categories = { $in: expandedCategoryIds };
    }
    if (name) {
      selector.name = { $regex: name, $options: 'i' };
    }
    if (status) {
      selector.status = status;
    }
    if (branchId) {
      selector.branchId = branchId;
    }
    applyCategoryFilters(selector, tags, categoryId);
    if (innerDate) {
      selector.startDate = { $lte: innerDate };
      selector.endDate = { $gte: innerDate };
    }
    if (date_status) {
      selector.date_status = date_status;
    }

    buildDateSelector(selector, 'startDate', startDate1, startDate2);
    buildDateSelector(selector, 'endDate', endDate1, endDate2);

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.Tours,
      params,
      query: selector,
    });

    return { list, totalCount, pageInfo };
  },

  async bmsToursTotalCount(
    _root: any,
    { branchId }: { branchId?: string },
    { models }: IContext,
  ): Promise<number> {
    const selector: Record<string, any> = {};

    if (branchId) {
      selector.branchId = branchId;
    }

    return models.Tours.countDocuments(selector);
  },

  async cpBmsTours(
    _root: any,
    {
      categories,
      tags,
      categoryId,
      name,
      status,
      innerDate,
      branchId,
      webId,
      startDate1,
      endDate1,
      startDate2,
      endDate2,
      date_status,
      ...params
    }: TourFilterParams,
    { models }: IContext,
  ): Promise<TourListResponse> {
    const selector: Record<string, any> = {};

    const expandedCategoryIds = await buildSubCategoryIds(models, categories);

    if (expandedCategoryIds.length) {
      selector.categories = { $in: expandedCategoryIds };
    }
    if (name) {
      selector.name = { $regex: name, $options: 'i' };
    }
    if (status) {
      selector.status = status;
    }
    if (branchId) {
      selector.branchId = branchId;
    }
    if (webId) {
      selector.webId = webId;
    }
    applyCategoryFilters(selector, tags, categoryId);
    if (innerDate) {
      selector.startDate = { $lte: innerDate };
      selector.endDate = { $gte: innerDate };
    }
    if (date_status) {
      selector.date_status = date_status;
    }

    buildDateSelector(selector, 'startDate', startDate1, startDate2);
    buildDateSelector(selector, 'endDate', endDate1, endDate2);

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.Tours,
      params,
      query: selector,
    });

    return { list, totalCount, pageInfo };
  },

  async cpBmsToursTotalCount(
    _root: any,
    { branchId, webId }: { branchId?: string; webId?: string },
    { models }: IContext,
  ): Promise<number> {
    const selector: Record<string, any> = {};

    if (branchId) {
      selector.branchId = branchId;
    }
    if (webId) {
      selector.webId = webId;
    }

    return models.Tours.countDocuments(selector);
  },

  async bmsTourDetail(
    _root: any,
    { _id }: { _id: string },
    { models }: IContext,
  ): Promise<ITourDocument | null> {
    return models.Tours.findById(_id);
  },

  async bmsTourCategories(_root, { parentId }, { models }: IContext) {
    const selector: any = {};

    if (parentId) {
      selector.parentId = parentId;
    } else if (parentId === null) {
      selector.parentId = null;
    }

    return models.BmsTourCategories.find(selector);
  },

  async cpBmsTourDetail(
    _root: any,
    { _id }: { _id: string },
    { models }: IContext,
  ): Promise<ITourDocument | null> {
    return models.Tours.findById(_id);
  },

  async bmToursGroup(
    _root,
    {
      categories,
      tags,
      categoryId,
      name,
      status,
      innerDate,
      branchId,
      startDate1,
      endDate1,
      startDate2,
      endDate2,
      groupCode,
      date_status,
      ...params
    },
    { models }: IContext,
  ) {
    const selector: any = {};

    const expandedCategoryIds = await buildSubCategoryIds(models, categories);

    if (expandedCategoryIds.length) {
      selector.categories = { $in: expandedCategoryIds };
    }
    if (name) {
      selector.name = { $regex: name, $options: 'i' };
    }
    if (status) {
      selector.status = status;
    }
    if (branchId) {
      selector.branchId = branchId;
    }
    applyCategoryFilters(selector, tags, categoryId);
    if (innerDate) {
      const dateToCheck = innerDate;
      selector.startDate = { $lte: dateToCheck };
      selector.endDate = { $gte: dateToCheck };
    }

    if (startDate2) {
      if (!selector.startDate) selector.startDate = {};
      selector.startDate['$lte'] = startDate2;
    }
    if (startDate1) {
      if (!selector.startDate) selector.startDate = {};
      selector.startDate['$gte'] = startDate1;
    }

    if (endDate2) {
      if (!selector.endDate) selector.endDate = {};
      selector.endDate['$lte'] = endDate2;
    }
    if (endDate1) {
      if (!selector.endDate) selector.endDate = {};
      selector.endDate['$gte'] = endDate1;
    }
    if (groupCode) {
      selector.groupCode = groupCode;
    }
    if (date_status) {
      selector.date_status = date_status;
    }

    const total = await models.Tours.find({
      ...selector,
      groupCode: { $nin: [null, ''] },
    }).countDocuments();

    const group = await models.Tours.aggregate([
      {
        $match: {
          ...selector,
          groupCode: { $nin: [null, ''] }, // Exclude null and empty strings
        },
      },
      {
        $group: {
          _id: '$groupCode', // group by category
          items: { $push: '$$ROOT' }, // push full documents into an array
        },
      },
    ]);
    return {
      list: [...group],
      total,
    };
  },

  async cpBmToursGroup(
    _root,
    {
      categories,
      tags,
      categoryId,
      name,
      status,
      innerDate,
      branchId,
      webId,
      startDate1,
      endDate1,
      startDate2,
      endDate2,
      groupCode,
      date_status,
      ...params
    },
    { models }: IContext,
  ) {
    const selector: any = {};

    const expandedCategoryIds = await buildSubCategoryIds(models, categories);

    if (expandedCategoryIds.length) {
      selector.categories = { $in: expandedCategoryIds };
    }
    if (name) {
      selector.name = { $regex: name, $options: 'i' };
    }
    if (status) {
      selector.status = status;
    }
    if (branchId) {
      selector.branchId = branchId;
    }
    if (webId) {
      selector.webId = webId;
    }
    applyCategoryFilters(selector, tags, categoryId);
    if (innerDate) {
      const dateToCheck = innerDate;
      selector.startDate = { $lte: dateToCheck };
      selector.endDate = { $gte: dateToCheck };
    }

    if (startDate2) {
      if (!selector.startDate) selector.startDate = {};
      selector.startDate['$lte'] = startDate2;
    }
    if (startDate1) {
      if (!selector.startDate) selector.startDate = {};
      selector.startDate['$gte'] = startDate1;
    }

    if (endDate2) {
      if (!selector.endDate) selector.endDate = {};
      selector.endDate['$lte'] = endDate2;
    }
    if (endDate1) {
      if (!selector.endDate) selector.endDate = {};
      selector.endDate['$gte'] = endDate1;
    }
    if (groupCode) {
      selector.groupCode = groupCode;
    }
    if (date_status) {
      selector.date_status = date_status;
    }

    const total = await models.Tours.find({
      ...selector,
      groupCode: { $nin: [null, ''] },
    }).countDocuments();

    const group = await models.Tours.aggregate([
      {
        $match: {
          ...selector,
          groupCode: { $nin: [null, ''] }, // Exclude null and empty strings
        },
      },
      {
        $group: {
          _id: '$groupCode', // group by category
          items: { $push: '$$ROOT' }, // push full documents into an array
        },
      },
    ]);
    return {
      list: [...group],
      total,
    };
  },

  async bmToursGroupDetail(_root, { groupCode, status }, { models }: IContext) {
    const selector: any = {};

    const list = await models.Tours.find({
      groupCode: groupCode,
      status: status,
    });

    return { _id: groupCode, items: list };
  },

  async cpBmToursGroupDetail(
    _root,
    { groupCode, status },
    { models }: IContext,
  ) {
    const selector: any = {};

    const list = await models.Tours.find({
      groupCode: groupCode,
      status: status,
    });

    return { _id: groupCode, items: list };
  },
};

export default tourQueries;

tourQueries.cpBmsTours.wrapperConfig = {
  forClientPortal: true,
};
tourQueries.cpBmsToursTotalCount.wrapperConfig = {
  forClientPortal: true,
};
tourQueries.cpBmsTourDetail.wrapperConfig = {
  forClientPortal: true,
};
tourQueries.cpBmToursGroup.wrapperConfig = {
  forClientPortal: true,
};
tourQueries.cpBmToursGroupDetail.wrapperConfig = {
  forClientPortal: true,
};

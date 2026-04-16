import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import {
  ITourDocument,
  TourFilterParams,
  TourListResponse,
} from '@/bms/@types/tour';
import { Resolver } from 'erxes-api-shared/core-types';
import {
  getBmsListWithTranslations,
  getBmsItemWithTranslation,
  TOUR_FIELD_MAPPINGS,
  applyTourTranslation,
  TOUR_CATEGORY_FIELD_MAPPINGS,
  shouldSkipTranslation,
} from '@/bms/utils/translations';

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

const escapeRegExp = (value: string): string =>
  value.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

async function buildSubCategoryIds(
  models: IContext['models'],
  categoryIds?: string[],
) {
  if (!categoryIds?.length) {
    return [];
  }

  let allSubcategories: string[] = [...categoryIds];
  let ids: string[] = [...categoryIds];
  const visited = new Set<string>(categoryIds);

  while (ids.length > 0) {
    const children = await models.BmsTourCategories.find(
      { parentId: { $in: ids } },
      { _id: 1 },
    );

    const newIds = children
      .map((x) => String(x._id))
      .filter((id) => !visited.has(id));

    if (!newIds.length) {
      break;
    }

    for (const id of newIds) {
      visited.add(id);
    }

    allSubcategories = [...newIds, ...allSubcategories];
    ids = newIds;
  }

  return allSubcategories;
}

const applyCategoryFilters = (
  selector: Record<string, any>,
  categoryIds?: string[],
) => {
  if (!categoryIds?.length) {
    return;
  }

  selector.$or = [
    { categoryIds: { $in: categoryIds } },
    { categories: { $in: categoryIds } },
    { tagIds: { $in: categoryIds } },
    { categoryId: { $in: categoryIds } },
  ];
};

const mergeCategoryFilterIds = ({
  categoryIds,
  tags,
}: {
  categoryIds?: string[];
  tags?: string[];
}) => {
  const merged = [...(categoryIds || []), ...(tags || [])].filter(Boolean);
  return merged.length ? [...new Set(merged)] : undefined;
};

async function applyTranslationsToTours(
  models: IContext['models'],
  tours: any[],
  language?: string,
  branchId?: string,
) {
  if (!language || !tours.length || !branchId) {
    return tours;
  }

  const skip = await shouldSkipTranslation(models, branchId, language);

  if (skip) {
    return tours;
  }

  const translations = await models.TourTranslations.find({
    objectId: { $in: tours.map((tour) => String(tour._id)) },
    language,
  }).lean();

  const translationMap = new Map(
    translations.map((translation) => [
      String(translation.objectId),
      translation,
    ]),
  );

  return tours.map((tour) => {
    const translation = translationMap.get(String(tour._id));

    return translation ? applyTourTranslation(tour, translation) : tour;
  });
}

function resolveGroupDisplayName(
  tours: Array<{ name?: string | null }>,
  fallback?: string,
) {
  const names = tours
    .map((tour) => tour?.name?.trim())
    .filter((name): name is string => Boolean(name));

  if (!names.length) {
    return fallback || 'Untitled tour';
  }

  const frequency = new Map<string, number>();

  for (const name of names) {
    frequency.set(name, (frequency.get(name) || 0) + 1);
  }

  return [...frequency.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

const tourQueries: Record<string, Resolver> = {
  async bmsTours(
    _root: any,
    {
      categoryIds,
      tags,
      name,
      status,
      innerDate,
      branchId,
      language,
      startDate1,
      endDate1,
      startDate2,
      endDate2,
      date_status,
      ...params
    }: TourFilterParams & { language?: string },
    { models }: IContext,
  ): Promise<TourListResponse> {
    const selector: Record<string, any> = {};

    const selectedCategoryIds = mergeCategoryFilterIds({ categoryIds, tags });
    const expandedCategoryIds = await buildSubCategoryIds(
      models,
      selectedCategoryIds,
    );

    if (name) selector.name = { $regex: escapeRegExp(name), $options: 'i' };
    if (status) selector.status = status;
    if (branchId) selector.branchId = branchId;

    applyCategoryFilters(
      selector,
      expandedCategoryIds.length ? expandedCategoryIds : undefined,
    );

    if (innerDate) {
      selector.startDate = { $lte: innerDate };
      selector.endDate = { $gte: innerDate };
    }
    if (date_status) selector.date_status = date_status;

    buildDateSelector(selector, 'startDate', startDate1, startDate2);
    buildDateSelector(selector, 'endDate', endDate1, endDate2);

    return getBmsListWithTranslations(
      models,
      models.Tours,
      models.TourTranslations,
      selector,
      { ...params, branchId, language },
      TOUR_FIELD_MAPPINGS,
      applyTourTranslation,
    );
  },

  bmsToursTotalCount(
    _root: any,
    { branchId }: { branchId?: string },
    { models }: IContext,
  ): Promise<number> {
    const selector: Record<string, any> = {};
    if (branchId) selector.branchId = branchId;
    return models.Tours.countDocuments(selector);
  },

  async cpBmsTours(
    _root: any,
    {
      categoryIds,
      tags,
      name,
      status,
      innerDate,
      branchId,
      webId,
      language,
      startDate1,
      endDate1,
      startDate2,
      endDate2,
      date_status,
      ...params
    }: TourFilterParams & { language?: string },
    { models }: IContext,
  ): Promise<TourListResponse> {
    const selector: Record<string, any> = {};

    const selectedCategoryIds = mergeCategoryFilterIds({ categoryIds, tags });
    const expandedCategoryIds = await buildSubCategoryIds(
      models,
      selectedCategoryIds,
    );

    if (name) selector.name = { $regex: escapeRegExp(name), $options: 'i' };
    if (status) selector.status = status;
    if (branchId) selector.branchId = branchId;
    if (webId) selector.webId = webId;

    applyCategoryFilters(
      selector,
      expandedCategoryIds.length ? expandedCategoryIds : undefined,
    );

    if (innerDate) {
      selector.startDate = { $lte: innerDate };
      selector.endDate = { $gte: innerDate };
    }
    if (date_status) selector.date_status = date_status;

    buildDateSelector(selector, 'startDate', startDate1, startDate2);
    buildDateSelector(selector, 'endDate', endDate1, endDate2);

    return getBmsListWithTranslations(
      models,
      models.Tours,
      models.TourTranslations,
      selector,
      { ...params, branchId, language },
      TOUR_FIELD_MAPPINGS,
      applyTourTranslation,
    );
  },

  cpBmsToursTotalCount(
    _root: any,
    { branchId, webId }: { branchId?: string; webId?: string },
    { models }: IContext,
  ): Promise<number> {
    const selector: Record<string, any> = {};
    if (branchId) selector.branchId = branchId;
    if (webId) selector.webId = webId;
    return models.Tours.countDocuments(selector);
  },

  bmsTourDetail(
    _root: any,
    { _id, language }: { _id: string; language?: string },
    { models }: IContext,
  ): Promise<ITourDocument | null> {
    return getBmsItemWithTranslation(
      models,
      models.Tours,
      models.TourTranslations,
      { _id },
      language,
      TOUR_FIELD_MAPPINGS,
      undefined,
      applyTourTranslation,
    );
  },

  bmsTourCategories: async (
    _root,
    { parentId, name, branchId, language },
    { models }: IContext,
  ) => {
    const selector: any = {};

    if (parentId) {
      selector.parentId = parentId;
    } else if (parentId === null) {
      selector.parentId = null;
    }
    if (name) selector.name = { $regex: escapeRegExp(name), $options: 'i' };
    if (branchId) selector.branchId = branchId;

    // No language — return raw sorted list
    if (!language) {
      return models.BmsTourCategories.find(selector).sort({
        order: 1,
        name: 1,
      });
    }

    // With language — overlay translations
    const { list } = await getBmsListWithTranslations(
      models,
      models.BmsTourCategories,
      models.TourCategoryTranslations,
      selector,
      { branchId, language, orderBy: { order: 1, name: 1 } },
      TOUR_CATEGORY_FIELD_MAPPINGS,
    );
    return list;
  },

  cpBmsTourDetail(
    _root: any,
    { _id, language }: { _id: string; language?: string },
    { models }: IContext,
  ): Promise<ITourDocument | null> {
    return getBmsItemWithTranslation(
      models,
      models.Tours,
      models.TourTranslations,
      { _id },
      language,
      TOUR_FIELD_MAPPINGS,
      undefined,
      applyTourTranslation,
    );
  },

  async bmToursGroup(
    _root,
    {
      categoryIds,
      tags,
      name,
      status,
      innerDate,
      branchId,
      language,
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

    const selectedCategoryIds = mergeCategoryFilterIds({ categoryIds, tags });
    const expandedCategoryIds = await buildSubCategoryIds(
      models,
      selectedCategoryIds,
    );

    if (name) selector.name = { $regex: escapeRegExp(name), $options: 'i' };
    if (status) selector.status = status;
    if (branchId) selector.branchId = branchId;

    applyCategoryFilters(
      selector,
      expandedCategoryIds.length ? expandedCategoryIds : undefined,
    );

    if (innerDate) {
      selector.startDate = { $lte: innerDate };
      selector.endDate = { $gte: innerDate };
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
    if (groupCode) selector.groupCode = groupCode;
    if (date_status) selector.date_status = date_status;

    const total = await models.Tours.find({
      ...selector,
      groupCode: { $nin: [null, ''] },
    }).countDocuments();

    const group = await models.Tours.aggregate([
      {
        $match: { ...selector, groupCode: { $nin: [null, ''] } },
      },
      {
        $group: {
          _id: '$groupCode',
          items: { $push: '$$ROOT' },
        },
      },
    ]);

    return {
      list: await Promise.all(
        group.map(async (item) => {
          const items = await applyTranslationsToTours(
            models,
            item.items || [],
            language,
            branchId,
          );

          return {
            ...item,
            name: resolveGroupDisplayName(items, item._id),
            items,
          };
        }),
      ),
      total,
    };
  },

  async cpBmToursGroup(
    _root,
    {
      categoryIds,
      tags,
      name,
      status,
      innerDate,
      branchId,
      webId,
      language,
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

    const selectedCategoryIds = mergeCategoryFilterIds({ categoryIds, tags });
    const expandedCategoryIds = await buildSubCategoryIds(
      models,
      selectedCategoryIds,
    );

    if (name) selector.name = { $regex: escapeRegExp(name), $options: 'i' };
    if (status) selector.status = status;
    if (branchId) selector.branchId = branchId;
    if (webId) selector.webId = webId;

    applyCategoryFilters(
      selector,
      expandedCategoryIds.length ? expandedCategoryIds : undefined,
    );

    if (innerDate) {
      selector.startDate = { $lte: innerDate };
      selector.endDate = { $gte: innerDate };
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
    if (groupCode) selector.groupCode = groupCode;
    if (date_status) selector.date_status = date_status;

    const total = await models.Tours.find({
      ...selector,
      groupCode: { $nin: [null, ''] },
    }).countDocuments();

    const group = await models.Tours.aggregate([
      {
        $match: { ...selector, groupCode: { $nin: [null, ''] } },
      },
      {
        $group: {
          _id: '$groupCode',
          items: { $push: '$$ROOT' },
        },
      },
    ]);

    return {
      list: await Promise.all(
        group.map(async (item) => {
          const items = await applyTranslationsToTours(
            models,
            item.items || [],
            language,
            branchId,
          );

          return {
            ...item,
            name: resolveGroupDisplayName(items, item._id),
            items,
          };
        }),
      ),
      total,
    };
  },

  async bmToursGroupDetail(
    _root,
    { groupCode, status, language },
    { models }: IContext,
  ) {
    const list = await models.Tours.find({ groupCode, status });
    const translatedItems = await Promise.all(
      list.map((tour) =>
        getBmsItemWithTranslation(
          models,
          models.Tours,
          models.TourTranslations,
          { _id: tour._id },
          language,
          TOUR_FIELD_MAPPINGS,
          undefined,
          applyTourTranslation,
        ),
      ),
    );

    const items = translatedItems.reduce<Array<{ _id?: string; name?: string | null }>>(
      (acc, tour) => {
        if (tour) {
          acc.push(tour);
        }

        return acc;
      },
      [],
    );

    return {
      _id: groupCode,
      name: resolveGroupDisplayName(items, groupCode),
      items,
    };
  },

  async cpBmToursGroupDetail(
    _root,
    { groupCode, status, language },
    { models }: IContext,
  ) {
    const list = await models.Tours.find({ groupCode, status });
    const translatedItems = await Promise.all(
      list.map((tour) =>
        getBmsItemWithTranslation(
          models,
          models.Tours,
          models.TourTranslations,
          { _id: tour._id },
          language,
          TOUR_FIELD_MAPPINGS,
          undefined,
          applyTourTranslation,
        ),
      ),
    );

    const items = translatedItems.reduce<Array<{ _id?: string; name?: string | null }>>(
      (acc, tour) => {
        if (tour) {
          acc.push(tour);
        }

        return acc;
      },
      [],
    );

    return {
      _id: groupCode,
      name: resolveGroupDisplayName(items, groupCode),
      items,
    };
  },
};

export default tourQueries;

tourQueries.cpBmsTours.wrapperConfig = { forClientPortal: true };
tourQueries.cpBmsToursTotalCount.wrapperConfig = { forClientPortal: true };
tourQueries.cpBmsTourDetail.wrapperConfig = { forClientPortal: true };
tourQueries.cpBmToursGroup.wrapperConfig = { forClientPortal: true };
tourQueries.cpBmToursGroupDetail.wrapperConfig = { forClientPortal: true };

import { cursorPaginate } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { SortOrder } from 'mongoose';

// ---------------------------------------------------------------------------
// Field mappings per model
// ---------------------------------------------------------------------------

export const ELEMENT_FIELD_MAPPINGS: Record<string, string> = {
  name: 'name',
  note: 'note',
  cost: 'cost',
};

export const ITINERARY_FIELD_MAPPINGS: Record<string, string> = {
  name: 'name',
  content: 'content',
  foodCost: 'foodCost',
  personCost: 'personCost',
  gasCost: 'gasCost',
  driverCost: 'driverCost',
  guideCost: 'guideCost',
  guideCostExtra: 'guideCostExtra',
};

export const TOUR_CATEGORY_FIELD_MAPPINGS: Record<string, string> = {
  name: 'name',
};

export const TOUR_FIELD_MAPPINGS: Record<string, string> = {
  name: 'name',
  refNumber: 'refNumber',
  content: 'content',
  info1: 'info1',
  info2: 'info2',
  info3: 'info3',
  info4: 'info4',
  info5: 'info5',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export async function shouldSkipTranslation(
  models: IModels,
  branchId: string,
  language: string,
): Promise<boolean> {
  if (!branchId || !language) return true;

  const branch = await models.Branches.findOne({ _id: branchId }).lean();
  return !branch || !branch.language || branch.language === language;
}

function buildTranslationMap(translations: any[]): Record<string, any> {
  return translations.reduce(
    (acc, t) => {
      acc[String(t.objectId)] = t;
      return acc;
    },
    {} as Record<string, any>,
  );
}

export function applyTranslationToItem<T extends { _id: string }>(
  item: T,
  translation: any,
  fieldMappings: Record<string, string>,
): T {
  if (!translation) return item;

  const result = { ...item };

  for (const [itemField, translationField] of Object.entries(fieldMappings)) {
    const value = translation[translationField];
    if (value !== undefined && value !== null && value !== '') {
      (result as any)[itemField] = value;
    }
  }

  return result;
}

/**
 * Overlay groupDays translations onto an itinerary.
 * Matches by day number.
 */
export function applyGroupDaysTranslation<T extends { _id: string }>(
  item: T,
  translation: any,
): T {
  if (!translation?.groupDays?.length) return item;

  const existingDays: any[] = (item as any).groupDays ?? [];
  if (!existingDays.length) return item;

  const dayTranslationMap: Record<number, any> = translation.groupDays.reduce(
    (acc: any, dt: any) => {
      acc[dt.day] = dt;
      return acc;
    },
    {},
  );

  const translatedDays = existingDays.map((day) => {
    const dt = dayTranslationMap[day.day];
    if (!dt) return day;
    return {
      ...day,
      ...(dt.title ? { title: dt.title } : {}),
      ...(dt.content ? { content: dt.content } : {}),
    };
  });

  return { ...(item as any), groupDays: translatedDays };
}

/**
 * Overlay pricingOptions translations onto a tour.
 * Matches by optionId.
 */
export function applyPricingOptionsTranslation<T extends { _id: string }>(
  item: T,
  translation: any,
): T {
  if (!translation?.pricingOptions?.length) return item;

  const existingOptions: any[] = (item as any).pricingOptions ?? [];
  if (!existingOptions.length) return item;

  const optionTranslationMap: Record<string, any> =
    translation.pricingOptions.reduce((acc: any, pt: any) => {
      acc[String(pt.optionId)] = pt;
      return acc;
    }, {});

  const translatedOptions = existingOptions.map((option) => {
    const pt = optionTranslationMap[String(option._id)];
    if (!pt) return option;
    return {
      ...option,
      ...(pt.title ? { title: pt.title } : {}),
      ...(pt.note ? { note: pt.note } : {}),
      ...(pt.accommodationType
        ? { accommodationType: pt.accommodationType }
        : {}),
      ...(Array.isArray(pt.prices) && pt.prices.length
        ? { prices: pt.prices }
        : {}),
      ...(typeof pt.pricePerPerson === 'number'
        ? { pricePerPerson: pt.pricePerPerson }
        : {}),
      ...(typeof pt.domesticFlightPerPerson === 'number'
        ? { domesticFlightPerPerson: pt.domesticFlightPerPerson }
        : {}),
      ...(typeof pt.singleSupplement === 'number'
        ? { singleSupplement: pt.singleSupplement }
        : {}),
    };
  });

  return { ...(item as any), pricingOptions: translatedOptions };
}

/**
 * Apply flat field mappings + groupDays for itineraries.
 */
export function applyItineraryTranslation<T extends { _id: string }>(
  item: T,
  translation: any,
): T {
  let result = applyTranslationToItem(
    item,
    translation,
    ITINERARY_FIELD_MAPPINGS,
  );
  result = applyGroupDaysTranslation(result, translation);
  return result;
}

/**
 * Apply flat field mappings + pricingOptions for tours.
 */
export function applyTourTranslation<T extends { _id: string }>(
  item: T,
  translation: any,
): T {
  let result = applyTranslationToItem(item, translation, TOUR_FIELD_MAPPINGS);
  result = applyPricingOptionsTranslation(result, translation);
  return result;
}

function applyTranslationsToList<T extends { _id: string }>(
  items: T[],
  translations: any[],
  fieldMappings: Record<string, string>,
  applyFn?: (item: T, translation: any) => T,
): T[] {
  if (!translations.length) return items;

  const translationMap = buildTranslationMap(translations);

  return items.map((item) => {
    const translation = translationMap[String(item._id)];
    if (!translation) return item;
    return applyFn
      ? applyFn(item, translation)
      : applyTranslationToItem(item, translation, fieldMappings);
  });
}

// ---------------------------------------------------------------------------
// Generic query args
// ---------------------------------------------------------------------------

export interface BmsListQueryArgs {
  branchId?: string;
  language?: string;
  sortField?: string;
  sortDirection?: string;
  orderBy?: Record<string, SortOrder>;
  [key: string]: any;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getBmsListWithTranslations<T extends { _id: string }>(
  models: IModels,
  model: any,
  translationModel: any,
  query: any,
  args: BmsListQueryArgs,
  fieldMappings: Record<string, string>,
  applyFn?: (item: T, translation: any) => T,
): Promise<{ list: T[]; totalCount: number; pageInfo: any }> {
  const params = { ...args };
  if (args.sortField && !args.orderBy) {
    const sortOrder: SortOrder = args.sortDirection === 'asc' ? 1 : -1;
    params.orderBy = { [args.sortField]: sortOrder };
  }

  const { list, totalCount, pageInfo } = await cursorPaginate<any>({
    model,
    params,
    query,
  });

  if (!args.language) {
    return { list, totalCount, pageInfo };
  }

  const branchId = args.branchId ?? '';
  const skip = await shouldSkipTranslation(models, branchId, args.language);

  if (skip) {
    return { list, totalCount, pageInfo };
  }

  const itemIds = list.map((item: any) => String(item._id));
  const translations = await translationModel
    .find({ objectId: { $in: itemIds }, language: args.language })
    .lean();

  const translatedList = applyTranslationsToList(
    list,
    translations,
    fieldMappings,
    applyFn,
  );

  return { list: translatedList, totalCount, pageInfo };
}

export async function getBmsItemWithTranslation<T extends { _id: string }>(
  models: IModels,
  model: any,
  translationModel: any,
  query: any,
  language: string | undefined,
  fieldMappings: Record<string, string>,
  branchId?: string,
  applyFn?: (item: T, translation: any) => T,
): Promise<T | null> {
  const item = (await model.findOne(query).lean()) as T | null;
  if (!item) return null;
  if (!language) return item;

  const effectiveBranchId = branchId ?? (item as any).branchId ?? '';
  const skip = await shouldSkipTranslation(models, effectiveBranchId, language);
  if (skip) return item;

  const translation = await translationModel
    .findOne({ objectId: String(item._id), language })
    .lean();

  if (!translation) return item;

  return applyFn
    ? applyFn(item, translation)
    : applyTranslationToItem(item, translation, fieldMappings);
}

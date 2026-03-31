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
};

// Add more mappings here as new models get translation support

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Skip translation when:
 *  - branchId or language is missing
 *  - requested language matches the branch's configured default language
 *    (the document is already stored in that language)
 */
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

function applyTranslationsToList<T extends { _id: string }>(
  items: T[],
  translations: any[],
  fieldMappings: Record<string, string>,
): T[] {
  if (!translations.length) return items;

  const translationMap = buildTranslationMap(translations);

  return items.map((item) => {
    const translation = translationMap[String(item._id)];
    return applyTranslationToItem(item, translation, fieldMappings);
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

/**
 * Paginated list with translation overlay — works for any BMS model.
 *
 * @param models           - Full models object (needed to look up branch language)
 * @param model            - Mongoose model to query  (e.g. models.Elements)
 * @param translationModel - Corresponding translation model (e.g. models.ElementTranslations)
 * @param query            - MongoDB filter
 * @param args             - Query args: language, branchId, pagination, sort
 * @param fieldMappings    - Map of document field → translation field
 *
 * @example
 *   // Elements
 *   getBmsListWithTranslations(models, models.Elements, models.ElementTranslations, query, args, ELEMENT_FIELD_MAPPINGS)
 *
 *   // Itineraries
 *   getBmsListWithTranslations(models, models.Itineraries, models.ItineraryTranslations, query, args, ITINERARY_FIELD_MAPPINGS)
 */
export async function getBmsListWithTranslations<T extends { _id: string }>(
  models: IModels,
  model: any,
  translationModel: any,
  query: any,
  args: BmsListQueryArgs,
  fieldMappings: Record<string, string>,
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

  const translatedList = applyTranslationsToList(list, translations, fieldMappings);

  return { list: translatedList, totalCount, pageInfo };
}

/**
 * Generic single-item fetch with translation overlay.
 */
export async function getBmsItemWithTranslation<T extends { _id: string }>(
  models: IModels,
  model: any,
  translationModel: any,
  query: any,
  language: string | undefined,
  fieldMappings: Record<string, string>,
  branchId?: string,
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

  return applyTranslationToItem(item, translation, fieldMappings);
}
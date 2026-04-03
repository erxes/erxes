import { IContext } from '~/connectionResolvers';
import {
  getBmsListWithTranslations,
  getBmsItemWithTranslation,
  ITINERARY_FIELD_MAPPINGS,
  mergeItineraryGroupDays,
} from '@/bms/utils/translations';

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const itineraryQueries = {
  async bmsItineraries(
    _root,
    { branchId, name, language, ...params },
    { models }: IContext,
  ) {
    const selector: any = {};
    if (branchId) {
      selector.branchId = branchId;
    }
    if (name) {
      selector.name = { $regex: escapeRegExp(name), $options: 'i' };
    }

    return getBmsListWithTranslations(
      models,
      models.Itineraries,
      models.ItineraryTranslations,
      selector,
      { ...params, branchId, language },
      ITINERARY_FIELD_MAPPINGS,
      mergeItineraryGroupDays,
    );
  },

  async bmsItineraryDetail(
    _root,
    { _id, language }: { _id: string; language?: string },
    { models }: IContext,
  ) {
    return getBmsItemWithTranslation(
      models,
      models.Itineraries,
      models.ItineraryTranslations,
      { _id },
      language,
      ITINERARY_FIELD_MAPPINGS,
      undefined,
      mergeItineraryGroupDays,
    );
  },
};

export default itineraryQueries;

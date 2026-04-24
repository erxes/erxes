import { IContext } from '~/connectionResolvers';
import {
  getBmsListWithTranslations,
  getBmsItemWithTranslation,
  ITINERARY_FIELD_MAPPINGS,
  applyItineraryTranslation,
} from '@/bms/utils/translations';
import { Resolver } from 'erxes-api-shared/core-types';

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const itineraryQueries : Record<string, Resolver> = {
  async bmsItineraries(
    _root,
    { branchId, name, language, ...params },
    { models }: IContext,
  ) {
    const selector: any = {};
    if (branchId) selector.branchId = branchId;
    if (name) selector.name = { $regex: escapeRegExp(name), $options: 'i' };

    return getBmsListWithTranslations(
      models,
      models.Itineraries,
      models.ItineraryTranslations,
      selector,
      { ...params, branchId, language },
      ITINERARY_FIELD_MAPPINGS,
      applyItineraryTranslation,
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
      applyItineraryTranslation,
    );
  },
  async cpBmsItineraries(
    _root,
    { branchId, name, language, ...params },
    { models }: IContext,
  ) {
    const selector: any = {};
    if (branchId) selector.branchId = branchId;
    if (name) selector.name = { $regex: escapeRegExp(name), $options: 'i' };

    return getBmsListWithTranslations(
      models,
      models.Itineraries,
      models.ItineraryTranslations,
      selector,
      { ...params, branchId, language },
      ITINERARY_FIELD_MAPPINGS,
      applyItineraryTranslation,
    );
  },
  async cpBmsItineraryDetail(
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
      applyItineraryTranslation,
    );
  },
};

export default itineraryQueries;

itineraryQueries.cpBmsItineraries.wrapperConfig={
  forClientPortal:true,
}
itineraryQueries.cpBmsItineraryDetail.wrapperConfig={
  forClientPortal:true,
}
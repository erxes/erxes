import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import type { IPricingOptionPrice, PassengerType } from '@/bms/@types/tour';

export interface PricingOptionPriceSource {
  type?: string | null;
  price?: number | null;
}

export interface PricingOptionSource {
  prices?: PricingOptionPriceSource[] | null;
  pricePerPerson?: number | null;
}

const isPassengerType = (
  value: string | null | undefined,
): value is PassengerType =>
  value === 'adult' || value === 'child' || value === 'infant';

const normalizePricingOptionPrices = (
  option: PricingOptionSource,
): IPricingOptionPrice[] => {
  const prices = Array.isArray(option.prices)
    ? option.prices
        .filter(
          (
            price,
          ): price is PricingOptionPriceSource & {
            type: PassengerType;
            price: number;
          } => isPassengerType(price.type) && typeof price.price === 'number',
        )
        .map((price) => ({ type: price.type, price: price.price }))
    : [];

  if (prices.length > 0) {
    return prices;
  }

  return typeof option.pricePerPerson === 'number'
    ? [{ type: 'adult', price: option.pricePerPerson }]
    : [];
};

const item = {
  async itinerary(touritem: any, _args, { models }: IContext) {
    return models.Itineraries.findById(touritem.itineraryId);
  },

  async orders(touritem: any, _args, { models }: IContext) {
    return models.Orders.find({ tourId: touritem?._id });
  },

  categoryIds(touritem: any) {
    if (touritem.categoryIds?.length) return touritem.categoryIds;
    if (touritem.tagIds?.length) return touritem.tagIds;
    if (touritem.categoryId) return [touritem.categoryId];
    if (touritem.categories?.length) return touritem.categories;
    return [];
  },

  tagIds(touritem: any) {
    if (touritem.tagIds?.length) return touritem.tagIds;
    if (touritem.categoryIds?.length) return touritem.categoryIds;
    return [];
  },

  pricingOptions(touritem: any) {
    return Array.isArray(touritem.pricingOptions)
      ? touritem.pricingOptions.filter(
          (option): option is PricingOptionSource => Boolean(option),
        )
      : [];
  },

  async categoriesObject(touritem: any, _args, { models }: IContext) {
    const ids =
      touritem.categoryIds ||
      touritem.categories ||
      touritem.tagIds ||
      (touritem.categoryId ? [touritem.categoryId] : []);

    return models.BmsTourCategories.find({ _id: { $in: ids } });
  },

  async guides(touritem: any, _args, { models, subdomain }: IContext) {
    const users = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'users',
      action: 'find',
      input: {
        query: {
          _id: { $in: touritem?.guides?.map((x) => x?.guideId) || [] },
        },
      },
    });

    return (touritem?.guides || []).map((x) => {
      const userOne = users.find((d) => d._id == x.guideId);
      return { guideId: x.guideId, type: x.type, guide: userOne };
    });
  },

  async translations(
    touritem: any,
    { language }: { language?: string },
    { models }: IContext,
  ) {
    const query: any = { objectId: touritem._id };
    if (language) query.language = language;
    const translations = await models.TourTranslations.find(query).lean();

    // Include the main language value so the frontend always has every language
    const mainLang = touritem.language;
    if (mainLang) {
      const alreadyExists = translations.some(
        (t: { language: string }) => t.language === mainLang,
      );

      if (!alreadyExists) {
        const original = await models.Tours.findOne({ _id: touritem._id })
          .select('name')
          .lean();

        if (original?.name) {
          translations.unshift({
            _id: `${touritem._id}_${mainLang}`,
            objectId: touritem._id,
            language: mainLang,
            name: original.name,
          } as unknown as (typeof translations)[number]);
        }
      }
    }

    return translations;
  },
};

export default item;

export const PricingOption = {
  prices: normalizePricingOptionPrices,
};

export const PricingOptionTranslation = {
  prices: normalizePricingOptionPrices,
};

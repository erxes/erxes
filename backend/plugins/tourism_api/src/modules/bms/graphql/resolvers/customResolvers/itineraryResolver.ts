import { IContext } from '~/connectionResolvers';
import { IItineraryDocument } from '@/bms/@types/itinerary';

const item = {
  async tours(itinerary: IItineraryDocument, _args, { models }: IContext) {
    return models.Tours.find({ itineraryId: itinerary._id });
  },

  async translations(itinerary: any, _args, { models }: IContext) {
    const translations = await models.ItineraryTranslations.find({
      objectId: itinerary._id,
    }).lean();

    // Include the main language value so the frontend always has every language
    if (itinerary.branchId) {
      const branch = await models.Branches.findOne({ _id: itinerary.branchId })
        .select('language')
        .lean();
      const mainLang = branch?.language;
      if (mainLang) {
        const alreadyExists = translations.some(
          (t: { language: string }) => t.language === mainLang,
        );

        if (!alreadyExists) {
          const original = await models.Itineraries.findOne({
            _id: itinerary._id,
          })
            .select('name')
            .lean();

          if (original?.name) {
            translations.unshift({
              _id: `${itinerary._id}_${mainLang}`,
              objectId: itinerary._id,
              language: mainLang,
              name: original.name,
            } as unknown as (typeof translations)[number]);
          }
        }
      }
    }

    return translations;
  },
};

export default item;

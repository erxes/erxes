import { IElement } from '@/bms/@types/element';
import { IContext } from '~/connectionResolvers';

const element = {
  async categoriesObject(element: IElement, _args, { models }: IContext) {
    return models.ElementCategories.find({
      _id: { $in: element.categories || [] },
    });
  },

  async translations(element: any, _args, { models }: IContext) {
    const translations = await models.ElementTranslations.find({
      objectId: element._id,
    }).lean();

    // Include the main language value so the frontend always has every language
    const mainLang = element.language;
    if (mainLang) {
      const alreadyExists = translations.some(
        (t: { language: string }) => t.language === mainLang,
      );

      if (!alreadyExists) {
        // element.name may have been swapped by getBmsListWithTranslations,
        // so read the original value from the database
        const original = await models.Elements.findOne({ _id: element._id })
          .select('name')
          .lean();

        if (original?.name) {
          translations.unshift({
            _id: `${element._id}_${mainLang}`,
            objectId: element._id,
            language: mainLang,
            name: original.name,
          } as unknown as (typeof translations)[number]);
        }
      }
    }

    return translations;
  },
};

export default element;

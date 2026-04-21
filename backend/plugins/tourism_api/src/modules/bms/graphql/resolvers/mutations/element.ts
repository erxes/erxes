import { IContext } from '~/connectionResolvers';
import { IElement } from '@/bms/@types/element';

const saveElementTranslations = async (
  models: IContext['models'],
  objectId: string,
  translations: any[],
) => {
  if (!Array.isArray(translations) || translations.length === 0) return;

  await Promise.all(
    translations.map((t) =>
      models.ElementTranslations.upsertTranslation({ ...t, objectId }),
    ),
  );
};

const elementMutations = {
  bmsElementAdd: async (
    _root,
    { translations, ...doc }: { translations?: any[] } & IElement,
    { user, models }: IContext,
  ) => {
    const element = await models.Elements.createElement(doc, user);
    if (!element || !element._id) {
      throw new Error('Failed to create element.');
    }
    await saveElementTranslations(models, element._id, translations ?? []);
    return element;
  },

  bmsElementEdit: async (
    _root,
    {
      _id,
      translations,
      ...doc
    }: { _id: string; translations?: any[] } & Partial<IElement>,
    { models }: IContext,
  ) => {
    const element = await models.Elements.updateElement(_id, doc as IElement);
    await saveElementTranslations(models, _id, translations ?? []);
    return element;
  },

  bmsElementRemove: async (
    _root,
    { ids }: { ids: string[] },
    { models }: IContext,
  ) => {
    await Promise.all(
      ids.map((id) =>
        models.ElementTranslations.deleteTranslationsForObject(id),
      ),
    );
    return models.Elements.removeElements(ids);
  },

  bmsElementCategoryAdd: async (_root, doc, { models }: IContext) => {
    return models.ElementCategories.createElementCategory(doc);
  },

  bmsElementCategoryEdit: async (
    _root,
    { _id, ...doc },
    { models }: IContext,
  ) => {
    return models.ElementCategories.updateElementCategory(_id, doc as any);
  },

  bmsElementCategoryRemove: async (
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.ElementCategories.removeElementCategory(_id);
  },

  bmsElementTranslationUpsert: async (
    _root,
    {
      input,
    }: {
      input: {
        objectId: string;
        language: string;
        name?: string;
        note?: string;
        cost?: number;
      };
    },
    { models }: IContext,
  ) => {
    const element = await models.Elements.findOne({ _id: input.objectId });
    if (!element) throw new Error('Element not found');
    return models.ElementTranslations.upsertTranslation(input);
  },

  bmsElementTranslationDelete: async (
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.ElementTranslations.deleteTranslation(_id);
  },
};

export default elementMutations;

import { IContext } from '~/connectionResolvers';

export const systemFieldQueries = {
  propertySystemFields: async (
    _root: undefined,
    { contentType }: { contentType: string },
    { models }: IContext,
  ) => {
    return models.SystemFieldSettings.getSystemFields(contentType);
  },
};

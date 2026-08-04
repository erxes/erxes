import { IContext } from '~/connectionResolvers';

export const noteQueries = {
  getNote: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('noteRead');

    return models.Note.findOne({ _id });
  },
};

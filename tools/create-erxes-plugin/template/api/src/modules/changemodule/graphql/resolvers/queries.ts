import { IContext } from '../../../../connectionResolvers';

export const changemoduleItemQueries = {
  async changemecChangemoduleItems(
    _root: unknown,
    { status }: { status?: string },
    { models, user }: IContext & { user?: { _id: string } },
  ) {
    if (!user) {
      throw new Error('Login required');
    }

    const filter: Record<string, string> = {};
    if (status) {
      filter.status = status;
    }
    return await models.ChangemoduleItems.find(filter).sort({ createdAt: -1 });
  },

  async changemecChangemoduleItem(
    _root: unknown,
    { _id }: { _id: string },
    { models, user }: IContext & { user?: { _id: string } },
  ) {
    if (!user) {
      throw new Error('Login required');
    }

    return await models.ChangemoduleItems.getItem(_id);
  },
};

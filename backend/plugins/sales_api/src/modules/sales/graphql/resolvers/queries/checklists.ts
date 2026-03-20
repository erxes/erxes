import { IContext } from '~/connectionResolvers';

export const checklistQueries = {
  /**
   * Checklists list
   */
  async salesChecklists(
    _root: undefined,
    { contentTypeId }: { contentTypeId: string },
    { models }: IContext,
  ) {
    return models.Checklists.find({ contentTypeId }).sort({
      createdAt: 1,
      order: 1,
    });
  },

  /**
   * Checklist
   */
  async salesChecklistDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.Checklists.findOne({ _id }).sort({ order: 1 });
  },
};


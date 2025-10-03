import { IContext } from '~/connectionResolvers';
import { IInternalNoteDocument } from '~/modules/internalNote/types';

export default {
  async createdUser(
    note: IInternalNoteDocument,
    _args: unknown,
    { models }: IContext,
  ) {
    if (!note.createdUserId) {
      return;
    }

    return await models.Users.findOne({ _id: note.createdUserId }).lean();
  },
};

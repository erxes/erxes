import { IContext } from '~/connectionResolvers';
import { IDocument } from '../types';

export const documentMutations = {
  /**
   * Save document configuration
   */
  documentsSave: async (
    _parent: undefined,
    params: { _id?: string } & IDocument,
    { user, models, checkPermission }: IContext,
  ) => {
    await checkPermission('manageDocuments');

    const { _id, ...doc } = params;

    return await models.Documents.saveDocument({
      _id,
      doc: { ...doc, createdUserId: user._id },
    });
  },

  documentsRemove: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('removeDocuments');

    const document = await models.Documents.getDocument({ _id });

    return await models.Documents.findOneAndDelete({ _id: document._id });
  },
};

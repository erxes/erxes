import { checkPermission } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import { IDocument } from '../types';

export const documentMutations = {
  /**
   * Save document configuration
   */
  documentsSave: async (
    _parent: undefined,
    params: { _id?: string } & IDocument,
    { user, models }: IContext,
  ) => {
    const { _id, ...doc } = params;

    return await models.Documents.saveDocument({
      _id,
      doc: { ...doc, createdUserId: user._id },
    });

    // await sendMessage({
    //   serviceName: 'core',
    //   subdomain,
    //   action: 'registerOnboardHistory',
    //   data: {
    //     type: 'documentTemplateCreate',
    //     user,
    //   },
    // });
  },

  documentsRemove: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return await models.Documents.findOneAndDelete({ _id });
  },
};

checkPermission(documentMutations, 'documentsSave', 'manageDocuments');
checkPermission(documentMutations, 'documentsRemove', 'removeDocuments');

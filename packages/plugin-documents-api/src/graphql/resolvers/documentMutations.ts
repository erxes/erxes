import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';
import { sendMessage } from '@erxes/api-utils/src/core';

const documentMutations = {
  /**
   * Save document configuration
   */
  async documentsSave(_root, args, { user, models, subdomain }: IContext) {
    const { _id, ...doc } = args;

    const document = await models.Documents.saveDocument({
      _id,
      doc: { ...doc, createdUserId: user._id },
    });

    await sendMessage({
      serviceName: 'core',
      subdomain,
      action: 'registerOnboardHistory',
      data: {
        type: 'documentTemplateCreate',
        user,
      },
    });

    return document;
  },

  async documentsRemove(_root, { _id }, { models }: IContext) {
    return models.Documents.deleteOne({ _id });
  },
};

checkPermission(documentMutations, 'documentsSave', 'manageDocuments');
checkPermission(documentMutations, 'documentsRemove', 'removeDocuments');

export default documentMutations;

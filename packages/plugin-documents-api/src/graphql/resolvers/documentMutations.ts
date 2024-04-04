import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';

const documentMutations = {
  /**
   * Save document configuration
   */
  documentsSave(_root, args, { user, models }: IContext) {
    const { _id, ...doc } = args;

    return models.Documents.saveDocument({
      _id,
      doc: { ...doc, createdUserId: user._id }
    });
  },

  documentsRemove(_root, { _id }, { models }: IContext) {
    return models.Documents.deleteOne({ _id });
  }
};

checkPermission(documentMutations, 'documentsSave', 'manageDocuments');
checkPermission(documentMutations, 'documentsRemove', 'removeDocuments');

export default documentMutations;

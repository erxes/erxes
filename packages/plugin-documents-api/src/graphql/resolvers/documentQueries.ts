import { checkPermission } from '@erxes/api-utils/src/permissions';
import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../connectionResolver';
import { sendCommonMessage } from '../../messageBroker';

const documentQueries = {
  documents(
    _root,
    { limit, contentType }: { limit: number; contentType: string },
    { models }: IContext
  ) {
    const sort = { date: -1 };

    const selector: any = {};

    if (contentType) {
      selector.contentType = contentType;
    }

    if (limit) {
      return models.Documents.find(selector)
        .sort(sort)
        .limit(limit);
    }

    return paginate(models.Documents.find(selector), {}).sort(sort);
  },

  documentsDetail(_root, { _id }, { models }: IContext) {
    return models.Documents.findOne({ _id });
  },

  async documentsGetEditorAttributes(
    _root,
    { contentType },
    { subdomain }: IContext
  ) {
    return sendCommonMessage({
      subdomain,
      serviceName: contentType,
      action: 'documents.editorAttributes',
      isRPC: true,
      data: {}
    });
  },

  documentsTotalCount(_root, _args, { models }: IContext) {
    return models.Documents.find({}).countDocuments();
  }
};

checkPermission(documentQueries, 'documents', 'manageDocuments', []);
checkPermission(documentQueries, 'documents', 'manageDocuments');
checkPermission(documentQueries, 'documents', 'manageDocuments');

export default documentQueries;

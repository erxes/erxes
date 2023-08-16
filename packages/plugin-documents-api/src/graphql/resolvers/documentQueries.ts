import { checkPermission } from '@erxes/api-utils/src/permissions';
import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../connectionResolver';
import { sendCommonMessage } from '../../messageBroker';
import { serviceDiscovery } from '../../configs';

const documentQueries = {
  documents(
    _root,
    {
      limit,
      contentType,
      subType
    }: { limit: number; contentType: string; subType?: string },
    { models }: IContext
  ) {
    const sort = { date: -1 };

    const selector: any = {};

    if (contentType) {
      selector.contentType = contentType;
    }

    if (subType) {
      selector.subType = subType;
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

  async documentsGetContentTypes(_root, args, { models }: IContext) {
    const services = await serviceDiscovery.getServices();
    const fieldTypes: Array<{
      label: string;
      contentType: string;
      subTypes?: string[];
    }> = [
      {
        label: 'Team members',
        contentType: 'core:user'
      }
    ];

    for (const serviceName of services) {
      const service = await serviceDiscovery.getService(serviceName, true);
      const meta = service.config.meta || {};
      if (meta && meta.documents) {
        const types = meta.documents.types || [];

        for (const type of types) {
          fieldTypes.push({
            label: type.label,
            contentType: `${type.type}`,
            subTypes: type.subTypes
          });
        }
      }
    }

    return fieldTypes;
  },

  async documentsGetEditorAttributes(
    _root,
    { contentType },
    { subdomain }: IContext
  ) {
    if (contentType === 'core:user') {
      const fields = await sendCommonMessage({
        subdomain,
        serviceName: 'forms',
        action: 'fields.fieldsCombinedByContentType',
        isRPC: true,
        data: {
          contentType
        }
      });

      return fields.map(f => ({ value: f.name, name: f.label }));
    }

    let data: any = {};

    if (contentType.match(new RegExp('contacts:'))) {
      data.contentType = contentType;
      contentType = 'contacts';
    }

    return sendCommonMessage({
      subdomain,
      serviceName: contentType,
      action: 'documents.editorAttributes',
      isRPC: true,
      data
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

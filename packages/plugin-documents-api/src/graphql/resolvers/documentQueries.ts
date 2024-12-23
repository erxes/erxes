import { checkPermission } from "@erxes/api-utils/src/permissions";
import { paginate } from "@erxes/api-utils/src";
import { IContext } from "../../connectionResolver";
import { sendCommonMessage } from "../../messageBroker";
import { getService, getServices } from "@erxes/api-utils/src/serviceDiscovery";
import common from "../../common";

interface IListParams {
  limit: number;
  contentType: string;
  subType?: string;
  page: number;
  perPage: number;
  searchValue: string;
}

const generateFilter = (args: IListParams) => {
  const { searchValue, contentType, subType } = args;

  const filter: any = {};

  if (contentType) {
    filter.contentType = contentType;
  }

  if (subType) {
    filter.$or = [
      { subType },
      { subType: { $exists: false } },
      { subType: { $in: ["", null, undefined] } }
    ];
  }

  if (searchValue) {
    filter.name = new RegExp(`.*${searchValue}.*`, "i");
  }

  return filter;
};

const documentQueries = {
  async documents(_root, args: IListParams, { models }: IContext) {
    const sort: any = { date: -1 };

    const selector = generateFilter(args);

    if (args.limit) {
      return models.Documents.find(selector).sort(sort).limit(args.limit);
    }

    return paginate(models.Documents.find(selector).sort(sort), args);
  },

  async documentsDetail(_root, { _id }, { models }: IContext) {
    return models.Documents.findOne({ _id });
  },

  async documentsGetContentTypes(_root, args, { models }: IContext) {
    const services = await getServices();
    const fieldTypes: Array<{
      label: string;
      contentType: string;
      subTypes?: string[];
    }> = [...common.types];

    for (const serviceName of services) {
      const service = await getService(serviceName);
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
    const [serviceName, type] = contentType.split(":");

    const editorAttributes = common.editorAttributes[type];

    if (editorAttributes) {
      return await editorAttributes({ subdomain, data: { contentType } });
    }

    return await sendCommonMessage({
      subdomain,
      serviceName,
      action: "documents.editorAttributes",
      data: {
        contentType
      },
      isRPC: true,
      defaultValue: []
    });
  },

  async documentsTotalCount(_root, args: IListParams, { models }: IContext) {
    const selector = generateFilter(args);

    return models.Documents.find(selector).countDocuments();
  }
};

checkPermission(documentQueries, "documents", "showDocuments", []);

export default documentQueries;

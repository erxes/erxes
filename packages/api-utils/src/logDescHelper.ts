import * as _ from 'underscore';
import {
  IStageDocument,
  IPipelineDocument,
  IChannelDocument,
  IIntegrationDocument,
  ICompanyDocument,
  ICustomerDocument,
  IDealDocument,
  ITaskDocument,
  ITicketDocument,
  IGrowthHackDocument,
  ITopicDocument,
  ICategoryDocument,
  IProductDocument,
  IScriptDocument,
  IPipelineTemplateDocument,
  IUserDocument
} from '@erxes/common-types';

import { MODULE_NAMES } from './constants';
import { LOG_ACTIONS } from './logUtils';
import {
  Pipelines,
  Forms,
  Users,
  Boards,
  Integrations,
  Tags,
  Brands,
  Companies,
  Customers,
  PipelineLabels,
  Stages,
  Deals,
  Tasks,
  Tickets,
  GrowthHacks,
  Products,
  Segments,
  KnowledgeBaseCategories,
  KnowledgeBaseArticles,
  ProductCategories,
  KnowledgeBaseTopics,
  UsersGroups,
  Checklists
} from './apiCollections';

type BoardItemDocument =
  | IDealDocument
  | ITaskDocument
  | ITicketDocument
  | IGrowthHackDocument;

export type LogDesc = {
  [key: string]: any;
} & { name: any };

interface ILogNameParams {
  idFields: string[];
  foreignKey: string;
  prevList?: LogDesc[];
}

interface ILogParams extends ILogNameParams {
  collection: any;
  nameFields: string[];
}

export interface IDescriptionParams {
  action: string;
  type: string;
  obj: any;
  updatedDocument?: any;
  extraParams?: any;
  newData?: any;
}

interface IDescriptions {
  description?: string;
  extraDesc?: LogDesc[];
}

interface IContentTypeParams {
  contentType: string;
  contentTypeId: string;
}

const gatherStageFieldNames = async (
  doc: IStageDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  if (doc.userId) {
    options = await gatherUsernames({
      idFields: [doc.userId],
      foreignKey: 'userId',
      prevList: options
    });
  }
  if (doc.pipelineId) {
    options = await gatherNames({
      collection: Pipelines,
      idFields: [doc.pipelineId],
      foreignKey: 'pipelineId',
      prevList: options,
      nameFields: ['name']
    });
  }
  if (doc.formId) {
    options = await gatherNames({
      collection: Forms,
      idFields: [doc.formId],
      foreignKey: 'formId',
      prevList: options,
      nameFields: ['title']
    });
  }

  return options;
};

/**
 * Finds name field from given collection
 * @param params.collection Collection to find
 * @param params.idFields Id fields saved in collection
 * @param params.foreignKey Name of id fields
 * @param params.prevList Array to save found id with name
 * @param params.nameFields List of values to be mapped to id field
 */
export const gatherNames = async (params: ILogParams): Promise<LogDesc[]> => {
  const {
    collection,
    idFields,
    foreignKey,
    prevList,
    nameFields = []
  } = params;
  let options: LogDesc[] = [];

  if (prevList && prevList.length > 0) {
    options = prevList;
  }

  const uniqueIds = _.compact(_.uniq(idFields));

  for (const id of uniqueIds) {
    const item = await collection.findOne({ _id: id });
    let name: string = `item with id "${id}" has been deleted`;

    if (item) {
      for (const n of nameFields) {
        if (item[n]) {
          name = item[n];
        }
      }
    }

    options.push({ [foreignKey]: id, name });
  }

  return options;
};

export const gatherUsernames = async (params: ILogNameParams): Promise<LogDesc[]> => {
  const { idFields, foreignKey, prevList } = params;

  return gatherNames({
    collection: Users,
    idFields,
    foreignKey,
    prevList,
    nameFields: ['email', 'username']
  });
};

const gatherPipelineFieldNames = async (
  doc: IPipelineDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  options = await gatherNames({
    collection: Boards,
    idFields: [doc.boardId],
    foreignKey: 'boardId',
    nameFields: ['name'],
    prevList: options
  });

  if (doc.userId) {
    options = await gatherUsernames({
      idFields: [doc.userId],
      foreignKey: 'userId',
      prevList: options
    });
  }

  if (doc.excludeCheckUserIds && doc.excludeCheckUserIds.length > 0) {
    options = await gatherUsernames({
      idFields: doc.excludeCheckUserIds,
      foreignKey: 'excludeCheckUserIds',
      prevList: options
    });
  }

  if (doc.memberIds && doc.memberIds.length > 0) {
    options = await gatherUsernames({
      idFields: doc.memberIds,
      foreignKey: 'memberIds',
      prevList: options
    });
  }

  if (doc.watchedUserIds && doc.watchedUserIds.length > 0) {
    options = await gatherUsernames({
      idFields: doc.watchedUserIds,
      foreignKey: 'watchedUserIds',
      prevList: options
    });
  }

  return options;
};

const gatherChannelFieldNames = async (
  doc: IChannelDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  if (doc.userId) {
    options = await gatherUsernames({
      idFields: [doc.userId],
      foreignKey: 'userId',
      prevList: options
    });
  }

  if (doc.memberIds && doc.memberIds.length > 0) {
    options = await gatherUsernames({
      idFields: doc.memberIds,
      foreignKey: 'memberIds',
      prevList: options
    });
  }

  if (doc.integrationIds && doc.integrationIds.length > 0) {
    options = await gatherIntegrationNames({
      idFields: doc.integrationIds,
      foreignKey: 'integrationIds',
      prevList: options
    });
  }

  return options;
};

const gatherIntegrationNames = async (
  params: ILogNameParams
): Promise<LogDesc[]> => {
  const { idFields, foreignKey, prevList } = params;

  return gatherNames({
    collection: Integrations,
    idFields,
    foreignKey,
    prevList,
    nameFields: ['name']
  });
};

const gatherIntegrationFieldNames = async (
  doc: IIntegrationDocument,
  prevList?: LogDesc[]
) => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  if (doc.createdUserId) {
    options = await gatherUsernames({
      idFields: [doc.createdUserId],
      foreignKey: 'createdUserId',
      prevList: options
    });
  }

  if (doc.brandId) {
    options = await gatherBrandNames({
      idFields: [doc.brandId],
      foreignKey: 'brandId',
      prevList: options
    });
  }

  if (doc.tagIds && doc.tagIds.length > 0) {
    options = await gatherTagNames({
      idFields: doc.tagIds,
      foreignKey: 'tagIds',
      prevList: options
    });
  }

  if (doc.formId) {
    options = await gatherNames({
      collection: Forms,
      idFields: [doc.formId],
      foreignKey: 'formId',
      prevList: options,
      nameFields: ['title']
    });
  }

  return options;
};

export const gatherTagNames = async (
  params: ILogNameParams
): Promise<LogDesc[]> => {
  const { idFields, foreignKey, prevList } = params;

  return gatherNames({
    collection: Tags,
    idFields,
    foreignKey,
    prevList,
    nameFields: ['name']
  });
};

export const gatherBrandNames = async (params: ILogNameParams): Promise<LogDesc[]> => {
  const { idFields, foreignKey, prevList } = params;

  return gatherNames({
    collection: Brands,
    idFields,
    foreignKey,
    prevList,
    nameFields: ['name']
  });
};

const gatherCompanyFieldNames = async (
  doc: ICompanyDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  if (doc.parentCompanyId) {
    options = await gatherNames({
      collection: Companies,
      idFields: [doc.parentCompanyId],
      foreignKey: 'parentCompanyId',
      prevList: options,
      nameFields: ['primaryName']
    });
  }

  if (doc.ownerId) {
    options = await gatherUsernames({
      idFields: [doc.ownerId],
      foreignKey: 'ownerId',
      prevList: options
    });
  }

  if (doc.mergedIds && doc.mergedIds.length > 0) {
    options = await gatherNames({
      collection: Companies,
      idFields: doc.mergedIds,
      foreignKey: 'mergedIds',
      prevList: options,
      nameFields: ['primaryName']
    });
  }

  if (doc.tagIds && doc.tagIds.length > 0) {
    options = await gatherTagNames({
      idFields: doc.tagIds,
      foreignKey: 'tagIds',
      prevList: options
    });
  }

  return options;
};

const gatherCustomerFieldNames = async (
  doc: ICustomerDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  if (doc.ownerId) {
    options = await gatherUsernames({
      idFields: [doc.ownerId],
      foreignKey: 'ownerId',
      prevList: options
    });
  }

  if (doc.integrationId) {
    options = await gatherIntegrationNames({
      idFields: [doc.integrationId],
      foreignKey: 'integrationId',
      prevList: options
    });
  }

  if (doc.tagIds && doc.tagIds.length > 0) {
    options = await gatherTagNames({
      idFields: doc.tagIds,
      foreignKey: 'tagIds',
      prevList: options
    });
  }

  if (doc.mergedIds) {
    options = await gatherNames({
      collection: Customers,
      idFields: doc.mergedIds,
      foreignKey: 'mergedIds',
      prevList: options,
      nameFields: ['firstName']
    });
  }

  return options;
};

const gatherBoardItemFieldNames = async (
  doc: BoardItemDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  if (doc.userId) {
    options = await gatherUsernames({
      idFields: [doc.userId],
      foreignKey: 'userId',
      prevList: options
    });
  }

  if (doc.assignedUserIds && doc.assignedUserIds.length > 0) {
    options = await gatherUsernames({
      idFields: doc.assignedUserIds,
      foreignKey: 'assignedUserIds',
      prevList: options
    });
  }

  if (doc.watchedUserIds && doc.watchedUserIds.length > 0) {
    options = await gatherUsernames({
      idFields: doc.watchedUserIds,
      foreignKey: 'watchedUserIds',
      prevList: options
    });
  }

  if (doc.labelIds && doc.labelIds.length > 0) {
    options = await gatherNames({
      collection: PipelineLabels,
      idFields: doc.labelIds,
      foreignKey: 'labelIds',
      prevList: options,
      nameFields: ['name']
    });
  }

  options = await gatherNames({
    collection: Stages,
    idFields: [doc.stageId],
    foreignKey: 'stageId',
    prevList: options,
    nameFields: ['name']
  });

  if (doc.initialStageId) {
    options = await gatherNames({
      collection: Stages,
      idFields: [doc.initialStageId],
      foreignKey: 'initialStageId',
      prevList: options,
      nameFields: ['name']
    });
  }

  if (doc.modifiedBy) {
    options = await gatherUsernames({
      idFields: [doc.modifiedBy],
      foreignKey: 'modifiedBy',
      prevList: options
    });
  }

  return options;
};

const findItemName = async ({
  contentType,
  contentTypeId
}: IContentTypeParams): Promise<string> => {
  let item: any;
  let name: string = '';

  if (contentType === MODULE_NAMES.DEAL) {
    item = await Deals.findOne({ _id: contentTypeId });
  }

  if (contentType === MODULE_NAMES.TASK) {
    item = await Tasks.findOne({ _id: contentTypeId });
  }

  if (contentType === MODULE_NAMES.TICKET) {
    item = await Tickets.findOne({ _id: contentTypeId });
  }

  if (contentType === MODULE_NAMES.GROWTH_HACK) {
    item = await GrowthHacks.getGrowthHack(contentTypeId);
  }

  if (item && item.name) {
    name = item.name;
  }

  return name;
};

const gatherDealFieldNames = async (
  doc: IDealDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  options = await gatherBoardItemFieldNames(doc, options);

  if (doc.productsData && doc.productsData.length > 0) {
    options = await gatherNames({
      collection: Products,
      idFields: doc.productsData.map(p => p.productId),
      foreignKey: 'productId',
      prevList: options,
      nameFields: ['name']
    });
  }

  return options;
};

const gatherGHFieldNames = async (
  doc: IGrowthHackDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  options = await gatherBoardItemFieldNames(doc, options);

  if (doc.votedUserIds && doc.votedUserIds.length > 0) {
    options = await gatherUsernames({
      idFields: doc.votedUserIds,
      foreignKey: 'votedUserIds',
      prevList: options
    });
  }

  return options;
};

const gatherKbTopicFieldNames = async (
  doc: ITopicDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  options = await gatherUsernames({
    idFields: [doc.createdBy],
    foreignKey: 'createdBy',
    prevList: options
  });

  options = await gatherUsernames({
    idFields: [doc.modifiedBy],
    foreignKey: 'modifiedBy',
    prevList: options
  });

  if (doc.brandId) {
    options = await gatherBrandNames({
      idFields: [doc.brandId],
      foreignKey: 'brandId',
      prevList: options
    });
  }

  if (doc.categoryIds && doc.categoryIds.length > 0) {
    // categories are removed alongside
    const categories = await KnowledgeBaseCategories.find(
      { _id: { $in: doc.categoryIds } },
      { title: 1 }
    );

    for (const cat of categories) {
      options.push({
        categoryIds: cat._id,
        name: cat.title
      });
    }
  }

  return options;
};

const gatherKbCategoryFieldNames = async (
  doc: ICategoryDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  const articles = await KnowledgeBaseArticles.find(
    { _id: { $in: doc.articleIds } },
    { title: 1 }
  );

  options = await gatherUsernames({
    idFields: [doc.createdBy],
    foreignKey: 'createdBy',
    prevList: options
  });

  options = await gatherUsernames({
    idFields: [doc.modifiedBy],
    foreignKey: 'modifiedBy',
    prevList: options
  });

  if (articles.length > 0) {
    for (const article of articles) {
      options.push({ articleIds: article._id, name: article.title });
    }
  }

  return options;
};

const gatherProductFieldNames = async (
  doc: IProductDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  if (doc.tagIds && doc.tagIds.length > 0) {
    options = await gatherTagNames({
      idFields: doc.tagIds,
      foreignKey: 'tagIds',
      prevList: options
    });
  }

  if (doc.categoryId) {
    options = await gatherNames({
      collection: ProductCategories,
      idFields: [doc.categoryId],
      foreignKey: 'categoryId',
      prevList: options,
      nameFields: ['name']
    });
  }

  return options;
};

const gatherScriptFieldNames = async (
  doc: IScriptDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  if (doc.messengerId) {
    options = await gatherIntegrationNames({
      idFields: [doc.messengerId],
      foreignKey: 'messengerId',
      prevList: options
    });
  }

  if (doc.kbTopicId) {
    options = await gatherNames({
      collection: KnowledgeBaseTopics,
      idFields: [doc.kbTopicId],
      foreignKey: 'kbTopicId',
      prevList: options,
      nameFields: ['title']
    });
  }

  if (doc.leadIds && doc.leadIds.length > 0) {
    options = await gatherIntegrationNames({
      idFields: doc.leadIds,
      foreignKey: 'leadIds',
      prevList: options
    });
  }

  return options;
};

const gatherPipelineTemplateFieldNames = async (
  doc: IPipelineTemplateDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  options = await gatherUsernames({
    idFields: [doc.createdBy || ''],
    foreignKey: 'createdBy',
    prevList: options
  });

  if (doc.stages && doc.stages.length > 0) {
    options = await gatherNames({
      collection: Forms,
      idFields: doc.stages.map(s => s.formId),
      foreignKey: 'formId',
      prevList: options,
      nameFields: ['title']
    });
  }

  return options;
};

const gatherUserFieldNames = async (
  doc: IUserDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  // show only user group names of users for now
  options = await gatherNames({
    collection: UsersGroups,
    idFields: doc.groupIds || [],
    foreignKey: 'groupIds',
    nameFields: ['name'],
    prevList: options
  });

  return options;
};

// used in internalNotes mutations
const findContentItemName = async (
  contentType: string,
  contentTypeId: string
): Promise<string> => {
  let name: string = '';

  if (contentType === MODULE_NAMES.DEAL) {
    const deal = await Deals.getDeal(contentTypeId);

    if (deal && deal.name) {
      name = deal.name;
    }
  }
  if (contentType === MODULE_NAMES.CUSTOMER) {
    const customer = await Customers.getCustomer(contentTypeId);

    if (customer) {
      name = Customers.getCustomerName(customer);
    }
  }
  if (contentType === MODULE_NAMES.COMPANY) {
    const company = await Companies.getCompany(contentTypeId);

    if (company) {
      name = Companies.getCompanyName(company);
    }
  }
  if (contentType === MODULE_NAMES.TASK) {
    const task = await Tasks.getTask(contentTypeId);

    if (task && task.name) {
      name = task.name;
    }
  }
  if (contentType === MODULE_NAMES.TICKET) {
    const ticket = await Tickets.getTicket(contentTypeId);

    if (ticket && ticket.name) {
      name = ticket.name;
    }
  }
  if (contentType === MODULE_NAMES.GROWTH_HACK) {
    const gh = await GrowthHacks.getGrowthHack(contentTypeId);

    if (gh && gh.name) {
      name = gh.name;
    }
  }
  if (contentType === MODULE_NAMES.USER) {
    const user = await Users.getUser(contentTypeId);

    if (user) {
      name = user.username || user.email || '';
    }
  }
  if (contentType === MODULE_NAMES.PRODUCT) {
    const product = await Products.getProduct({ _id: contentTypeId });

    if (product) {
      name = product.name;
    }
  }

  return name;
};

export const gatherDescriptions = async (
  params: IDescriptionParams
): Promise<IDescriptions> => {
  const { action, type, obj, updatedDocument } = params;

  let extraDesc: LogDesc[] = [];
  let description: string = '';

  switch (type) {
    case MODULE_NAMES.BRAND:
    case MODULE_NAMES.BOARD_DEAL:
    case MODULE_NAMES.BOARD_GH:
    case MODULE_NAMES.BOARD_TASK:
    case MODULE_NAMES.BOARD_TICKET:
      if (obj.userId) {
        extraDesc = await gatherUsernames({
          idFields: [obj.userId],
          foreignKey: 'userId'
        });
      }

      description = `"${obj.name}" has been ${action}d`;

      break;
    case MODULE_NAMES.PIPELINE_DEAL:
    case MODULE_NAMES.PIPELINE_GH:
    case MODULE_NAMES.PIPELINE_TASK:
    case MODULE_NAMES.PIPELINE_TICKET:
      extraDesc = await gatherPipelineFieldNames(obj);

      if (updatedDocument) {
        extraDesc = await gatherPipelineFieldNames(updatedDocument, extraDesc);
      }

      description = `"${obj.name}" has been ${action}d`;

      break;
    case MODULE_NAMES.CHANNEL:
      extraDesc = await gatherChannelFieldNames(obj);
      description = `"${obj.name}" has been ${action}d`;

      if (updatedDocument) {
        extraDesc = await gatherChannelFieldNames(updatedDocument, extraDesc);
      }

      break;
    case MODULE_NAMES.CHECKLIST:
      const itemName = await findItemName({
        contentType: obj.contentType,
        contentTypeId: obj.contentTypeId
      });

      extraDesc = await gatherUsernames({
        idFields: [obj.createdUserId],
        foreignKey: 'createdUserId'
      });

      extraDesc.push({ contentTypeId: obj.contentTypeId, name: itemName });

      if (action === LOG_ACTIONS.CREATE) {
        description = `"${
          obj.title
        }" has been created in ${obj.contentType.toUpperCase()} "${itemName}"`;
      }
      if (action === LOG_ACTIONS.UPDATE) {
        description = `"${
          obj.title
        }" saved in ${obj.contentType.toUpperCase()} "${itemName}" has been edited`;
      }
      if (action === LOG_ACTIONS.DELETE) {
        description = `"${
          obj.title
        }" from ${obj.contentType.toUpperCase()} "${itemName}" has been removed`;
      }

      break;
    case MODULE_NAMES.CHECKLIST_ITEM:
      const checklist = await Checklists.getChecklist(obj.checklistId);

      extraDesc = await gatherUsernames({
        idFields: [obj.createdUserId],
        foreignKey: 'createdUserid'
      });

      extraDesc.push({ checklistId: checklist._id, name: checklist.title });

      if (action === LOG_ACTIONS.CREATE) {
        description = `"${obj.content}" has been added to "${checklist.title}"`;
      }
      if (action === LOG_ACTIONS.UPDATE) {
        description = `"${obj.content}" has been edited /checked/`;
      }
      if (action === LOG_ACTIONS.DELETE) {
        description = `"${obj.content}" has been removed from "${checklist.title}"`;
      }

      break;
    case MODULE_NAMES.COMPANY:
      extraDesc = await gatherCompanyFieldNames(obj);
      description = `"${obj.primaryName}" has been ${action}d`;

      if (updatedDocument) {
        extraDesc = await gatherCompanyFieldNames(updatedDocument, extraDesc);
      }

      break;
    case MODULE_NAMES.CUSTOMER:
      description = `"${obj.firstName}" has been ${action}d`;

      extraDesc = await gatherCustomerFieldNames(obj);

      if (updatedDocument) {
        extraDesc = await gatherCustomerFieldNames(updatedDocument, extraDesc);
      }

      break;
    case MODULE_NAMES.DEAL:
      description = `"${obj.name}" has been ${action}d`;
      extraDesc = await gatherDealFieldNames(obj);

      if (updatedDocument) {
        extraDesc = await gatherDealFieldNames(updatedDocument, extraDesc);
      }

      break;
    case MODULE_NAMES.EMAIL_TEMPLATE:
      description = `"${obj.name}" has been ${action}d`;

      break;
    case MODULE_NAMES.GROWTH_HACK:
      description = `"${obj.name}" has been ${action}d`;

      extraDesc = await gatherGHFieldNames(obj);

      if (updatedDocument) {
        extraDesc = await gatherGHFieldNames(updatedDocument, extraDesc);
      }

      break;
    case MODULE_NAMES.IMPORT_HISTORY:
      description = `${obj._id}-${obj.date} has been removed`;

      extraDesc = await gatherUsernames({
        idFields: [obj.userId],
        foreignKey: 'userId',
        prevList: extraDesc
      });

      const param = {
        idFields: obj.ids,
        foreignKey: 'ids',
        prevList: extraDesc
      };

      switch (obj.contentType) {
        case MODULE_NAMES.COMPANY:
          extraDesc = await gatherNames({
            ...param,
            collection: Companies,
            nameFields: ['primaryName']
          });
          break;
        case MODULE_NAMES.CUSTOMER:
          extraDesc = await gatherNames({
            ...param,
            collection: Customers,
            nameFields: ['firstName']
          });
          break;
        case MODULE_NAMES.PRODUCT:
          extraDesc = await gatherNames({
            ...param,
            collection: Products,
            nameFields: ['name']
          });
          break;
        default:
          break;
      }

      break;
    case MODULE_NAMES.INTEGRATION:
      description = `"${obj.name}" has been ${action}d`;

      extraDesc = await gatherIntegrationFieldNames(obj);

      if (updatedDocument) {
        extraDesc = await gatherIntegrationFieldNames(
          updatedDocument,
          extraDesc
        );
      }

      break;
    case MODULE_NAMES.INTERNAL_NOTE:
      description = `Note of type ${obj.contentType} has been ${action}d`;

      extraDesc = [
        {
          contentTypeId: obj.contentTypeId,
          name: await findContentItemName(obj.contentType, obj.contentTypeId)
        }
      ];

      extraDesc = await gatherUsernames({
        idFields: [obj.createdUserId],
        foreignKey: 'createdUserId',
        prevList: extraDesc
      });

      break;
    case MODULE_NAMES.KB_TOPIC:
      description = `"${obj.title}" has been ${action}d`;

      extraDesc = await gatherKbTopicFieldNames(obj);

      if (updatedDocument) {
        extraDesc = await gatherKbTopicFieldNames(updatedDocument, extraDesc);
      }

      break;
    case MODULE_NAMES.KB_CATEGORY:
      description = `"${obj.title}" has been ${action}d`;

      extraDesc = await gatherKbCategoryFieldNames(obj);

      if (updatedDocument) {
        extraDesc = await gatherKbCategoryFieldNames(
          updatedDocument,
          extraDesc
        );
      }

      break;
    case MODULE_NAMES.KB_ARTICLE:
      description = `"${obj.title}" has been ${action}d`;

      extraDesc = await gatherUsernames({
        idFields: [obj.createdBy],
        foreignKey: 'createdBy'
      });

      if (obj.modifiedBy) {
        extraDesc = await gatherUsernames({
          idFields: [obj.modifiedBy],
          foreignKey: 'modifiedBy',
          prevList: extraDesc
        });
      }

      if (updatedDocument && updatedDocument.modifiedBy) {
        extraDesc = await gatherUsernames({
          idFields: [updatedDocument.modifiedBy],
          foreignKey: 'modifiedBy',
          prevList: extraDesc
        });
      }

      break;
    case MODULE_NAMES.PERMISSION:
      description = `Permission of module "${obj.module}", action "${obj.action}" assigned to `;

      if (obj.groupId) {
        const group = await UsersGroups.getGroup(obj.groupId);

        description = `${description} user group "${group.name}" `;

        extraDesc.push({ groupId: obj.groupId, name: group.name });
      }

      if (obj.userId) {
        const permUser = await Users.getUser(obj.userId);

        description = `${description} user "${permUser.email}" has been ${action}d`;

        extraDesc.push({
          userId: obj.userId,
          name: permUser.username || permUser.email
        });
      }

      break;
    case MODULE_NAMES.PIPELINE_LABEL:
      description = `"${obj.name}" has been ${action}d`;

      const pipeline = await Pipelines.findOne({ _id: obj.pipelineId });

      extraDesc = await gatherUsernames({
        idFields: [obj.createdBy],
        foreignKey: 'createdBy'
      });

      if (pipeline) {
        extraDesc.push({ pipelineId: pipeline._id, name: pipeline.name });
      }

      break;
    case MODULE_NAMES.PIPELINE_TEMPLATE:
      extraDesc = await gatherPipelineTemplateFieldNames(obj);

      description = `"${obj.name}" has been created`;

      if (updatedDocument) {
        extraDesc = await gatherPipelineTemplateFieldNames(
          updatedDocument,
          extraDesc
        );
      }

      break;
    case MODULE_NAMES.PRODUCT:
      description = `${obj.name} has been ${action}d`;

      extraDesc = await gatherProductFieldNames(obj);

      if (updatedDocument) {
        extraDesc = await gatherProductFieldNames(updatedDocument, extraDesc);
      }

      break;
    case MODULE_NAMES.PRODUCT_CATEGORY:
      description = `"${obj.name}" has been ${action}d`;

      const parentIds: string[] = [];

      if (obj.parentId) {
        parentIds.push(obj.parentId);
      }

      if (updatedDocument && updatedDocument.parentId !== obj.parentId) {
        parentIds.push(updatedDocument.parentId);
      }

      if (parentIds.length > 0) {
        extraDesc = await gatherNames({
          collection: ProductCategories,
          idFields: parentIds,
          foreignKey: 'parentId',
          nameFields: ['name']
        });
      }

      break;
    case MODULE_NAMES.RESPONSE_TEMPLATE:
      description = `"${obj.name}" has been created`;

      const brandIds: string[] = [];

      if (obj.brandId) {
        brandIds.push(obj.brandId);
      }

      if (
        updatedDocument &&
        updatedDocument.brandId &&
        updatedDocument.brandId !== obj.brandId
      ) {
        brandIds.push(updatedDocument.brandId);
      }

      if (brandIds.length > 0) {
        extraDesc = await gatherBrandNames({
          idFields: brandIds,
          foreignKey: 'brandId'
        });
      }

      break;
    case MODULE_NAMES.SCRIPT:
      description = `"${obj.name}" has been ${action}d`;

      extraDesc = await gatherScriptFieldNames(obj);

      if (updatedDocument) {
        extraDesc = await gatherScriptFieldNames(updatedDocument, extraDesc);
      }

      break;
    case MODULE_NAMES.SEGMENT:
      const parents: string[] = [];

      if (obj.subOf) {
        parents.push(obj.subOf);
      }

      if (
        updatedDocument &&
        updatedDocument.subOf &&
        updatedDocument.subOf !== obj.subOf
      ) {
        parents.push(updatedDocument.subOf);
      }

      if (parents.length > 0) {
        extraDesc = await gatherNames({
          collection: Segments,
          idFields: parents,
          foreignKey: 'subOf',
          nameFields: ['name']
        });
      }

      description = `"${obj.name}" has been ${action}d`;

      break;
    case MODULE_NAMES.TASK:
      description = `"${obj.name}" has been ${action}d`;

      extraDesc = await gatherBoardItemFieldNames(obj);

      if (updatedDocument) {
        extraDesc = await gatherBoardItemFieldNames(updatedDocument, extraDesc);
      }

      break;
    case MODULE_NAMES.TICKET:
      description = `"${obj.name}" has been ${action}d`;

      extraDesc = await gatherBoardItemFieldNames(obj);

      if (updatedDocument) {
        extraDesc = await gatherBoardItemFieldNames(updatedDocument, extraDesc);
      }

      break;
    case MODULE_NAMES.USER:
      description = `"${obj.username || obj.email}" has been ${action}d`;

      extraDesc = await gatherUserFieldNames(obj);

      if (updatedDocument) {
        extraDesc = await gatherUserFieldNames(updatedDocument, extraDesc);
      }

      break;
    case MODULE_NAMES.STAGE_DEAL:
    case MODULE_NAMES.STAGE_TASK:
    case MODULE_NAMES.STAGE_TICKET:
    case MODULE_NAMES.STAGE_GH:
      description = `"${obj.name}" has been ${action}d`;

      extraDesc = await gatherStageFieldNames(obj, extraDesc);

      if (updatedDocument) {
        extraDesc = await gatherStageFieldNames(updatedDocument, extraDesc);
      }

      break;

    default:
      break;
  }

  return { extraDesc, description };
};

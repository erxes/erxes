import { gatherNames, LogDesc } from "@erxes/api-utils/src/logUtils";
import { Integrations } from "./models";
import { IChannelDocument } from "./models/definitions/channels";
import { IIntegrationDocument } from "./models/definitions/integrations";
import { findMongoDocuments } from "./messageBroker";

const findFromCore = async (ids: string[], collectionName: string) => {
  return await findMongoDocuments(
    'api-core',
    { query: { _id: { $in: ids } }, name: collectionName }
  );
}

const gatherIntegrationFieldNames = async (
  doc: IIntegrationDocument,
  prevList?: LogDesc[]
) => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  if (doc.createdUserId) {
    options = await gatherNames({
      nameFields: ['email', 'username'],
      foreignKey: 'createdUserId',
      prevList: options,
      items: await findFromCore([doc.createdUserId], 'Users')
    });
  }

  if (doc.brandId) {
    options = await gatherNames({
      foreignKey: 'brandId',
      prevList: options,
      nameFields: ['name'],
      items: await findFromCore([doc.brandId], 'Brands')
    });
  }

  if (doc.tagIds && doc.tagIds.length > 0) {
    options = await gatherNames({
      foreignKey: 'tagIds',
      prevList: options,
      nameFields: ['name'],
      items: await findMongoDocuments(
        'tags', { name: 'Tags', query: { _id: { $in: doc.tagIds } } }
      )
    });
  }

  if (doc.formId) {
    options = await gatherNames({
      foreignKey: 'formId',
      prevList: options,
      nameFields: ['title'],
      items: await findFromCore([doc.formId], 'Forms')
    });
  }

  return options;
};

export const gatherChannelFieldNames = async (
  doc: IChannelDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  if (doc.userId) {
    options = await gatherNames({
      nameFields: ['userId'],
      foreignKey: 'userId',
      prevList: options,
      items: await findFromCore([doc.userId], 'Users')
    });
  }

  if (doc.memberIds && doc.memberIds.length > 0) {
    options = await gatherNames({
      nameFields: ['memberIds'],
      foreignKey: 'memberIds',
      prevList: options,
      items: await findFromCore(doc.memberIds, 'Users')
    });
  }

  if (doc.integrationIds && doc.integrationIds.length > 0) {
    options = await gatherNames({
      foreignKey: 'integrationIds',
      prevList: options,
      nameFields: ['name'],
      items: await Integrations.findIntegrations({ _id: { $in: doc.integrationIds } })
    });
  }

  return options;
};

export const gatherIntegrationDescriptions = async (params: any) => {
  const { object, updatedDocument } = params;

  const description = `"${object.name}" has been`;

  let extraDesc = await gatherIntegrationFieldNames(object);

  if (updatedDocument) {
    extraDesc = await gatherIntegrationFieldNames(
      updatedDocument,
      extraDesc
    );
  }

  return { description, extraDesc };
}

export const gatherChannelDescriptions = async (params: any) => {
  const { object, updatedDocument } = params;

  const description = `"${object.name}" has been`;
  let extraDesc = await gatherChannelFieldNames(object);

  if (updatedDocument) {
    extraDesc = await gatherChannelFieldNames(updatedDocument, extraDesc);
  }

  return { description, extraDesc };
}

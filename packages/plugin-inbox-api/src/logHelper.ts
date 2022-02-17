import { gatherNames, LogDesc } from "@erxes/api-utils/src/logUtils";
import { Brands, Forms, Tags, Users } from "./apiCollections";
import { Integrations } from "./models";
import { IChannelDocument } from "./models/definitions/channels";
import { IIntegrationDocument } from "./models/definitions/integrations";

const userFields = { collection: Users, nameFields: ['email', 'username'] };

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
      ...userFields,
      idFields: [doc.createdUserId],
      foreignKey: 'createdUserId',
      prevList: options,
    });
  }

  if (doc.brandId) {
    options = await gatherNames({
      collection: Brands,
      idFields: [doc.brandId],
      foreignKey: 'brandId',
      prevList: options,
      nameFields: ['name']
    });
  }

  if (doc.tagIds && doc.tagIds.length > 0) {
    options = await gatherNames({
      collection: Tags,
      idFields: doc.tagIds,
      foreignKey: 'tagIds',
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
      ...userFields,
      idFields: [doc.userId],
      foreignKey: 'userId',
      prevList: options
    });
  }

  if (doc.memberIds && doc.memberIds.length > 0) {
    options = await gatherNames({
      ...userFields,
      idFields: doc.memberIds,
      foreignKey: 'memberIds',
      prevList: options
    });
  }

  if (doc.integrationIds && doc.integrationIds.length > 0) {
    options = await gatherNames({
      collection: Integrations,
      idFields: doc.integrationIds,
      foreignKey: 'integrationIds',
      prevList: options,
      nameFields: ['name']
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

import { gatherNames, LogDesc } from "@erxes/api-utils/src/logDescHelper";
import { Brands, Forms, Tags, Users } from "./apiCollections";
import { IIntegrationDocument } from "./models/definitions/integrations";

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
      collection: Users,
      idFields: [doc.createdUserId],
      foreignKey: 'createdUserId',
      prevList: options,
      nameFields: ['email', 'username']
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

export const gatherDescriptions = async (params: any) => {
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

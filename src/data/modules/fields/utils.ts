import { Fields } from '../../../db/models';

// Checking field names, all field names must be configured correctly
export const checkFieldNames = async (type: string, fields: string[]) => {
  const properties: any[] = [];

  for (let fieldName of fields) {
    if (!fieldName) {
      continue;
    }

    fieldName = fieldName.trim();

    const property: { [key: string]: any } = {};

    const fieldObj = await Fields.findOne({ text: fieldName, contentType: type });

    // Collecting custom fields
    if (fieldObj) {
      property.type = 'customProperty';
      property.id = fieldObj._id;
    }

    if (fieldName === 'companiesPrimaryNames') {
      property.name = 'companyIds';
      property.type = 'companiesPrimaryNames';
    }

    if (fieldName === 'customersPrimaryEmails') {
      property.name = 'customerIds';
      property.type = 'customersPrimaryEmails';
    }

    if (fieldName === 'ownerEmail') {
      property.name = 'ownerId';
      property.type = 'ownerEmail';
    }

    if (fieldName === 'tag') {
      property.name = 'tagIds';
      property.type = 'tag';
    }

    if (fieldName === 'boardName') {
      property.name = 'boardId';
      property.type = 'boardName';
    }

    if (fieldName === 'pipelineName') {
      property.name = 'pipelineId';
      property.type = 'pipelineName';
    }

    if (fieldName === 'stageName') {
      property.name = 'stageId';
      property.type = 'stageName';
    }
    // Collecting basic fields
    else {
      property.name = fieldName;
      property.type = 'basic';
    }

    properties.push(property);
  }

  return properties;
};

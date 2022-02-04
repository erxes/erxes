import { Fields, FieldsGroups } from '../../../db/models';
import { IFieldGroup } from '../../../db/models/definitions/fields';
import { fetchElk } from '../../../elasticsearch';
import messageBroker from '../../../messageBroker';
// import { findElk } from '../../resolvers/mutations/engageUtils';
import { isUsingElk } from '../../utils';

export const getCustomFields = async (contentType: string) => {
  return Fields.find({
    contentType,
    isDefinedByErxes: false
  });

  // if (!isUsingElk()) {
  //   return Fields.find({
  //     contentType,
  //     isDefinedByErxes: false
  //   });
  // }

  // return findElk('fields', {
  //   bool: {
  //     must: [
  //       {
  //         match: {
  //           contentType
  //         }
  //       },
  //       {
  //         match: {
  //           isDefinedByErxes: false
  //         }
  //       }
  //     ]
  //   }
  // });
};

const getFieldGroup = async (_id: string) => {
  if (!isUsingElk()) {
    return FieldsGroups.findOne({ _id });
  }
  const response = await fetchElk({
    action: 'get',
    index: 'fields_groups',
    body: null,
    _id,
    defaultValue: null
  });

  return response && { _id: response._id, ...response._source };
};

// Checking field names, all field names must be configured correctly
export const checkFieldNames = async (
  fields: string[],
  columnConfig?: object
) => {
  const properties: any[] = [];

  for (let fieldName of fields) {
    if (!fieldName) {
      continue;
    }

    fieldName = fieldName.trim();

    const property: { [key: string]: any } = {};

    if (columnConfig) {
      fieldName = columnConfig[fieldName].value;
    }

    if (!property.type) {
      throw new Error(`Bad column name ${fieldName}`);
    }

    properties.push(property);
  }

  return properties;
};

export const getFormFields = async (formId: string) => {
  return Fields.find({
    contentType: 'form',
    isDefinedByErxes: false,
    contentTypeId: formId
  });

  // if (!isUsingElk()) {
  //   return Fields.find({
  //     contentType: 'form',
  //     isDefinedByErxes: false,
  //     contentTypeId: formId
  //   });
  // }

  // return findElk('fields', {
  //   bool: {
  //     must: [
  //       {
  //         match: {
  //           contentType: 'form'
  //         }
  //       },
  //       {
  //         match: {
  //           isDefinedByErxes: false
  //         }
  //       },
  //       {
  //         match: {
  //           contentTypeId: formId
  //         }
  //       }
  //     ]
  //   }
  // });
};

/*
 * Generates fields using given schema
 */

/**
 * Generates all field choices base on given kind.
 */
export const fieldsCombinedByContentType = async ({
  contentType,
  usageType,
  excludedNames,
  pipelineId,
  segmentId,
  formId,
  serviceType
}: {
  contentType: string;
  usageType?: string;
  excludedNames?: string[];
  boardId?: string;
  segmentId?: string;
  pipelineId?: string;
  formId?: string;
  serviceType?: string;
}) => {
  let fields: Array<{
    _id: number;
    name: string;
    group?: string;
    label?: string;
    type?: string;
    validation?: string;
    options?: string[];
    selectOptions?: Array<{ label: string; value: string }>;
  }> = [];

  if (serviceType) {
    fields = await messageBroker().sendRPCMessage(
      `${serviceType}:rpc_queue:getFields`,
      {
        contentType,
        segmentId,
        pipelineId,
        usageType,
        formId
      }
    );
  }

  const customFields = await getCustomFields(contentType);

  // extend fields list using custom fields data
  for (const customField of customFields) {
    const group = await getFieldGroup(customField.groupId || '');

    if (
      group &&
      group.isVisible
      // (customField.isVisibleDetail || customField.isVisibleDetail === undefined)
    ) {
      fields.push({
        _id: Math.random(),
        name: `customFieldsData.${customField._id}`,
        label: customField.text,
        options: customField.options,
        validation: customField.validation,
        type: customField.type
      });
    }
  }

  fields = [...fields];

  return fields.filter(field => !(excludedNames || []).includes(field.name));
};

export const getBoardsAndPipelines = (doc: IFieldGroup) => {
  const boardIds: string[] = [];
  const pipelineIds: string[] = [];

  const boardsPipelines = doc.boardsPipelines || [];

  for (const item of boardsPipelines) {
    boardIds.push(item.boardId || '');

    const pipelines = item.pipelineIds || [];

    for (const pipelineId of pipelines) {
      pipelineIds.push(pipelineId);
    }
  }
  doc.boardIds = boardIds;
  doc.pipelineIds = pipelineIds;

  return doc;
};

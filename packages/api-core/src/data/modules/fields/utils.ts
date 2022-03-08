import { findElkFields } from '../../../db/models/fieldUtils';
import { Fields, FieldsGroups } from '../../../db/models';
import { fetchElk } from '../../../elasticsearch';
import { isUsingElk } from '../../utils';
import { sendRPCMessage } from '../../../messageBroker';

export const getCustomFields = async (contentType: string) => {
  if (!isUsingElk()) {
    return Fields.find({
      contentType,
      isDefinedByErxes: false
    });
  }

  return findElkFields({
    bool: {
      must: [
        {
          match: {
            contentType
          }
        },
        {
          match: {
            isDefinedByErxes: false
          }
        }
      ]
    }
  });
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
    fields = await sendRPCMessage(
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

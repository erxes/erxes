import { useQuery } from '@apollo/client';
import { IFieldLogicRule, isFieldVisibleByLogic } from 'ui-modules';
import { GET_CONVERT_SYSTEM_FIELDS } from '@/inbox/conversations/graphql/queries/getConvertSystemFields';
import { ConversationConvertType } from '@/inbox/conversations/types/conversationConvert';
import { isRecord } from '@/shared/utils/isRecord';
import {
  CONVERT_SYSTEM_FIELD_KEYS,
  CONVERT_TYPE_OPTIONS,
  TConvertSystemFieldKey,
  getConvertSystemFieldCode,
} from '@/inbox/conversations/conversation-detail/components/convert/convertForm';

const readText = (value: unknown) => (typeof value === 'string' ? value : '');

/** `logics` is JSON; keep the rules `isFieldVisibleByLogic` evaluates. */
const readLogicRules = (logics: unknown): IFieldLogicRule[] =>
  Array.isArray(logics)
    ? logics.flatMap((rule) =>
        isRecord(rule) && typeof rule.field === 'string' && rule.field
          ? [
              {
                field: rule.field,
                operator: readText(rule.operator),
                value: readText(rule.value),
                action: readText(rule.action),
              },
            ]
          : [],
      )
    : [];

export const useConvertSystemFields = (
  type: ConversationConvertType,
  propertiesData: Record<string, unknown>,
) => {
  const { data } = useQuery(GET_CONVERT_SYSTEM_FIELDS, {
    variables: { contentType: CONVERT_TYPE_OPTIONS[type].propertyContentType },
    fetchPolicy: 'cache-and-network',
  });

  const systemFields = data?.propertySystemFields || [];

  const shownFields = CONVERT_SYSTEM_FIELD_KEYS.flatMap((key) => {
    const systemField = systemFields.find(
      (item) => item.code === getConvertSystemFieldCode(type, key),
    );

    return systemField?.isVisibleToCreate &&
      isFieldVisibleByLogic(
        { logics: readLogicRules(systemField.logics) },
        propertiesData,
      )
      ? [{ key, isRequired: systemField.isRequired }]
      : [];
  });

  const shownKeys: TConvertSystemFieldKey[] = shownFields.map(({ key }) => key);
  const requiredKeys: TConvertSystemFieldKey[] = shownFields
    .filter(({ isRequired }) => isRequired)
    .map(({ key }) => key);

  return { shownKeys, requiredKeys };
};

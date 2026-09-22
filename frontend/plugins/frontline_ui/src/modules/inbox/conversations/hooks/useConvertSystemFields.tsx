import { useQuery } from '@apollo/client';
import { isFieldVisibleByLogic } from 'ui-modules';
import { GET_CONVERT_SYSTEM_FIELDS } from '@/inbox/conversations/graphql/queries/getConvertSystemFields';
import {
  ConversationConvertType,
  IConvertSystemField,
} from '@/inbox/conversations/types/conversationConvert';
import {
  CONVERT_SYSTEM_FIELD_KEYS,
  CONVERT_TYPE_OPTIONS,
  TConvertSystemFieldKey,
  getConvertSystemFieldCode,
} from '@/inbox/conversations/conversation-detail/components/convert/convertForm';

export const useConvertSystemFields = (
  type: ConversationConvertType,
  propertiesData: Record<string, unknown>,
) => {
  const { data } = useQuery<{
    propertySystemFields: IConvertSystemField[] | null;
  }>(GET_CONVERT_SYSTEM_FIELDS, {
    variables: { contentType: CONVERT_TYPE_OPTIONS[type].propertyContentType },
    fetchPolicy: 'cache-and-network',
  });

  const systemFields = data?.propertySystemFields || [];

  const shownFields = CONVERT_SYSTEM_FIELD_KEYS.flatMap((key) => {
    const systemField = systemFields.find(
      (item) => item.code === getConvertSystemFieldCode(type, key),
    );

    return systemField?.isVisibleToCreate &&
      isFieldVisibleByLogic(systemField, propertiesData)
      ? [{ key, isRequired: systemField.isRequired }]
      : [];
  });

  const shownKeys: TConvertSystemFieldKey[] = shownFields.map(({ key }) => key);
  const requiredKeys: TConvertSystemFieldKey[] = shownFields
    .filter(({ isRequired }) => isRequired)
    .map(({ key }) => key);

  return { shownKeys, requiredKeys };
};

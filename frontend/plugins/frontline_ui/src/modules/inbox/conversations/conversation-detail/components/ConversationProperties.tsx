import { FieldsInDetail } from 'ui-modules';
import { useConversationCustomFieldEdit } from '@/inbox/conversations/hooks/useConversationCustomFieldEdit';

const CONTENT_TYPE = 'frontline:conversation';

export const ConversationProperties = ({
  id,
  propertiesData,
}: {
  id: string;
  propertiesData?: Record<string, unknown>;
}) => {
  return (
    <FieldsInDetail
      fieldContentType={CONTENT_TYPE}
      propertiesData={propertiesData || {}}
      mutateHook={useConversationCustomFieldEdit}
      id={id}
    />
  );
};

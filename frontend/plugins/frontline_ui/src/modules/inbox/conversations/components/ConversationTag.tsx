import { SelectTags } from 'ui-modules';

export const ConversationTag = ({
  conversationIds,
}: {
  conversationIds: string[];
}) => {
  return (
    <SelectTags.Detail
      tagType="inbox:conversation"
      targetIds={conversationIds}
    />
  );
};

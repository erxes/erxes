import { toast } from 'erxes-ui';
import { SelectTags } from 'ui-modules';

export const ConversationTag = ({
  conversationIds,
}: {
  conversationIds: string[];
}) => {
  return (
    <SelectTags.Detail
      tagType="frontline:conversation"
      targetIds={conversationIds}
      mode={'multiple'}
      options={(newTagIds: string[]) => ({
        onCompleted: () => {
          toast({
            title: 'Tag updated',
            variant: 'default',
          });
        },
        onError: (error: Error) => {
          toast({
            title: 'Failed to update tags',
            description: error.message,
            variant: 'destructive',
          });
        },
      })}
    />
  );
};

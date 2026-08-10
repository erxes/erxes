import { toast } from 'erxes-ui';
import { SelectTags } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const ConversationTag = ({
  conversationIds,
}: {
  conversationIds: string[];
}) => {
  const { t } = useTranslation('frontline');
  return (
    <SelectTags.Detail
      tagType="frontline:conversation"
      targetIds={conversationIds}
      mode={'multiple'}
      options={(newTagIds: string[]) => ({
        onCompleted: () => {
          toast({
            title: t('tag-updated'),
            variant: 'default',
          });
        },
        onError: (error: Error) => {
          toast({
            title: t('failed-to-update-tags'),
            description: error.message,
            variant: 'destructive',
          });
        },
      })}
    />
  );
};

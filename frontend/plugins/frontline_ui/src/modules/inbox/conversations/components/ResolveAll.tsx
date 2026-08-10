import { Button, Spinner, toast } from 'erxes-ui';
import { IconCheckbox } from '@tabler/icons-react';
import { useConversationResolveAll } from '../conversation-detail/hooks/useConversationResolveAll';
import { useSetAtom } from 'jotai';
import { selectConversationsState } from '../states/selectConversationsState';
import { useTranslation } from 'react-i18next';

export const ResolveAll = ({
  conversationIds,
}: {
  conversationIds: string[];
}) => {
  const { t } = useTranslation('frontline');
  const { resolveAllConversations, loading } = useConversationResolveAll();
  const setSelectedConversations = useSetAtom(selectConversationsState);
  const handleResolveAll = () => {
    resolveAllConversations({
      variables: {
        ids: conversationIds,
      },
      onCompleted: () => {
        toast({
          title: t('conversations-resolved'),
          variant: 'default',
        });
        setSelectedConversations([]);
      },
    });
  };
  return (
    <Button variant="secondary" onClick={handleResolveAll} disabled={loading}>
      {loading ? <Spinner size="sm" /> : <IconCheckbox />}
      {t('resolve-all')}
    </Button>
  );
};

import { Button, Spinner, toast } from 'erxes-ui';
import { IconCheckbox } from '@tabler/icons-react';
import { useConversationResolveAll } from '../conversation-detail/hooks/useConversationResolveAll';
import { useSetAtom } from 'jotai';
import { selectConversationsState } from '../states/selectConversationsState';

export const ResolveAll = ({
  conversationIds,
}: {
  conversationIds: string[];
}) => {
  const { resolveAllConversations, loading } = useConversationResolveAll();
  const setSelectedConversations = useSetAtom(selectConversationsState);
  const handleResolveAll = () => {
    resolveAllConversations({
      variables: {
        ids: conversationIds,
      },
      onCompleted: () => {
        toast({
          title: 'Conversations resolved',
          variant: 'default',
        });
        setSelectedConversations([]);
      },
    });
  };
  return (
    <Button variant="secondary" onClick={handleResolveAll} disabled={loading}>
      {loading ? <Spinner size="sm" /> : <IconCheckbox />}
      Resolve All
    </Button>
  );
};

import { Button, Spinner } from 'erxes-ui';
import { IconCheckbox } from '@tabler/icons-react';
import { useConversationResolveAll } from '../conversation-detail/hooks/useConversationResolveAll';
import { toast } from 'erxes-ui';

export const ResolveAll = ({
  conversationIds,
}: {
  conversationIds: string[];
}) => {
  const { resolveAllConversations, loading } = useConversationResolveAll();
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

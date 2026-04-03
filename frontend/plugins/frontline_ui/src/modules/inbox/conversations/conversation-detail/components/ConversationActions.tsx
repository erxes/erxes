import { Toggle } from 'erxes-ui';
import { useChangeConversationStatus } from '@/inbox/conversations/hooks/useChangeConversationStatus';
import { useConversationContext } from '@/inbox/conversations/hooks/useConversationContext';
import { ConversationStatus } from '@/inbox/types/Conversation';
import { useAtomValue } from 'jotai';
import { refetchConversationsAtom } from '../../states/refetchConversationState';

export const ConversationActions = () => {
  const { changeConversationStatus, loading } = useChangeConversationStatus();
  const refetchConversations = useAtomValue(refetchConversationsAtom);

  const { _id, status } = useConversationContext();

  const handleChangeConversationStatus = (pressed: boolean) => {
    changeConversationStatus({
      variables: {
        ids: [_id],
        status: pressed ? ConversationStatus.CLOSED : ConversationStatus.OPEN,
      },
    });
    if (refetchConversations) {
      refetchConversations();
    }
  };

  return (
    <Toggle
      variant="outline"
      className="flex-none"
      pressed={status === ConversationStatus.CLOSED}
      onPressedChange={handleChangeConversationStatus}
      disabled={loading}
    >
      {status === ConversationStatus.CLOSED ? 'Open' : 'Resolve'}
    </Toggle>
  );
};

import { Button, ScrollArea, Separator, Skeleton, toast } from 'erxes-ui';
import { CustomersInline, SelectMember } from 'ui-modules';
import { useConversationContext } from '@/inbox/conversations/hooks/useConversationContext';
import { useAssignConversations } from '@/inbox/conversations/hooks/useAssignConversations';
import { ConversationActions } from './ConversationActions';
import { useQueryState } from 'erxes-ui';
import { IconArrowLeft } from '@tabler/icons-react';
import { useAtomValue } from 'jotai';
import { inboxLayoutState } from '@/inbox/states/inboxLayoutState';
import { IntegrationActions } from '@/integrations/components/IntegrationActions';

export const ConversationHeader = () => {
  const { customerId, loading, customer } = useConversationContext();
  const [, setConversationId] = useQueryState<string>('conversationId');
  const view = useAtomValue(inboxLayoutState);

  return (
    <ScrollArea className="flex-none">
      <div className="h-11 flex items-center px-5 text-xs font-medium text-accent-foreground flex-none gap-3 whitespace-nowrap">
        {view === 'list' && (
          <Button
            variant="secondary"
            size="icon"
            className="[&>svg]:size-4 text-foreground"
            onClick={() => setConversationId(null)}
          >
            <IconArrowLeft />
          </Button>
        )}
        {!loading ? (
          <CustomersInline
            customers={customer ? [customer] : undefined}
            customerIds={customerId ? [customerId] : undefined}
            className="text-sm text-foreground flex-none"
            placeholder="anonymous customer"
          />
        ) : (
          <Skeleton className="w-32 h-4 ml-2" />
        )}
        <Separator.Inline />
        <AssignConversation />
        <div className="flex items-center gap-3 ml-auto">
          <IntegrationActions />
          <ConversationActions />
        </div>
      </div>
      <ScrollArea.Bar orientation="horizontal" />
    </ScrollArea>
  );
};

const AssignConversation = () => {
  const { assignedUserId, _id } = useConversationContext();
  const { assignConversations } = useAssignConversations();

  const handleAssignConversations = (value: null | string | string[]) => {
    assignConversations({
      variables: {
        conversationIds: [_id],
        assignedUserId: value,
      },
      onError: (error: Error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <div className="flex">
      <SelectMember
        value={assignedUserId}
        onValueChange={handleAssignConversations}
        className="text-foreground shadow-none px-2"
        size="lg"
      />
    </div>
  );
};

// const Tags = () => {
//   const { _id, tagIds } = useConversationContext();

//   return (
//     <SelectTags.Detail
//       tagType="inbox:conversation"
//       className="flex-none w-auto"
//       variant="ghost"
//       value={tagIds}
//       targetIds={[_id]}
//     />
//   );
// };

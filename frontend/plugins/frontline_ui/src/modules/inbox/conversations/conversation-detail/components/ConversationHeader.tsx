import { Button, ScrollArea, Separator, Skeleton, toast } from 'erxes-ui';
import { CustomersInline, SelectMember, SelectTags } from 'ui-modules';
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
          <ConversationTags />
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
    const result = Array.isArray(value) ? value[value.length - 1] : value;

    assignConversations({
      variables: {
        conversationIds: [_id],
        assignedUserId: result,
      },
      onError: (error: Error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
      refetchQueries: ['ConversationDetail', 'Conversations']
    });
  };

  return (
    <div className="flex">
      <SelectMember
        mode="single"
        value={assignedUserId}
        onValueChange={handleAssignConversations}
        className="text-foreground shadow-none px-2"
        size="lg"
      />
    </div>
  );
};

export const ConversationTags = () => {
  const { _id, tagIds, setTagIds } = useConversationContext();

  if (!_id) return null;

  const handleTagChange = (newTagIds: string[] | string) => {
    const ids = Array.isArray(newTagIds) ? newTagIds : [newTagIds];

    setTagIds?.(ids);
  };

  return (
    <div className='flex-none max-w-lg overflow-x-hidden'>
      <SelectTags.ConversationDetail
        tagType="frontline:conversation"
        mode="multiple"
        value={tagIds}
        targetIds={[_id]}
        onValueChange={handleTagChange}
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
    </div>
  );
};

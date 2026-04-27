import { useAssignConversations } from '@/inbox/conversations/hooks/useAssignConversations';
import { useConversationContext } from '@/inbox/conversations/hooks/useConversationContext';
import { useChangeConversationStatus } from '@/inbox/conversations/hooks/useChangeConversationStatus';
import { inboxLayoutState } from '@/inbox/states/inboxLayoutState';
import { sideWidgetOpenState } from '@/inbox/states/sideWidgetOpenState';
import { refetchConversationsAtom } from '../../states/refetchConversationState';
import { ConversationStatus } from '@/inbox/types/Conversation';
import { IntegrationActions } from '@/integrations/components/IntegrationActions';
import { IconArrowLeft, IconDots } from '@tabler/icons-react';
import {
  Button,
  DropdownMenu,
  ScrollArea,
  Separator,
  Skeleton,
  toast,
  useQueryState,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { CustomersInline, SelectMember, SelectTags } from 'ui-modules';
import { ConversationActions } from './ConversationActions';

export const ConversationHeader = () => {
  const { customerId, loading, customer } = useConversationContext();
  const [, setConversationId] = useQueryState<string>('conversationId');
  const view = useAtomValue(inboxLayoutState);
  const isSideWidgetOpen = useAtomValue(sideWidgetOpenState);

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
        {isSideWidgetOpen ? (
          <div className="ml-auto flex-none">
            <ConversationActionsDropdown />
          </div>
        ) : (
          <div className="flex items-center gap-3 pr-px ml-auto min-w-0 overflow-hidden">
            <ConversationTags />
            <IntegrationActions />
            <ConversationActions />
          </div>
        )}
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
      refetchQueries: ['ConversationDetail', 'Conversations'],
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
    <div className="flex-none">
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

const ConversationActionsDropdown = () => {
  const { _id, status } = useConversationContext();
  const { changeConversationStatus, loading } = useChangeConversationStatus();
  const refetchConversations = useAtomValue(refetchConversationsAtom);

  const handleStatusChange = () => {
    changeConversationStatus({
      variables: {
        ids: [_id],
        status:
          status === ConversationStatus.CLOSED
            ? ConversationStatus.OPEN
            : ConversationStatus.CLOSED,
      },
    });
    if (refetchConversations) {
      refetchConversations();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon" className="[&>svg]:size-4">
          <IconDots />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="min-w-[260px]">
        <div
          className="px-2 py-1.5"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <ConversationTags />
        </div>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onSelect={handleStatusChange} disabled={loading}>
          {status === ConversationStatus.CLOSED ? 'Open' : 'Resolve'}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

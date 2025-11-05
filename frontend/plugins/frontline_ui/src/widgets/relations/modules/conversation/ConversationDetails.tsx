import { useConversationDetail } from '@/inbox/conversations/conversation-detail/hooks/useConversationDetail';
import {
  BlockEditorReadOnly,
  Button,
  Card,
  cn,
  IconComponent,
  RelativeDateDisplay,
  Sheet,
  Spinner,
  Tooltip,
  useQueryState,
} from 'erxes-ui';
import { CustomersInline, ICustomerInline } from 'ui-modules';
import { useConversationContext } from '@/inbox/conversations/hooks/useConversationContext';
import { useChannelInline } from '@/inbox/channel/hooks/useChannelInline';
import { ConversationIntegrationBadge } from '@/integrations/components/IntegrationBadge';
import { format } from 'date-fns';
import { Suspense, useState } from 'react';
import { ConversationContext } from '@/inbox/conversations/context/ConversationContext';
import { ConversationDetailView } from './ConversationDetailView';
import { IChannel } from '@/inbox/types/Channel';
import { IIntegration } from '@/integrations/types/Integration';

export const ConversationRelationDetails = ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const [open, setOpen] = useState(false);
  const [, setConversationId] = useQueryState<string>('relatedConversationId');
  const { conversationDetail } = useConversationDetail({
    variables: {
      _id: conversationId,
    },
  });
  const { customer, createdAt, integration, updatedAt } =
    conversationDetail || {};
  const { channelId } = integration || {};
  const { channelDetail } = useChannelInline({
    variables: {
      id: channelId,
    },
  });

  const handleOpen = (open: boolean) => {
    if (!open) {
      setConversationId(null);
    } else {
      setConversationId(conversationId);
    }
    setOpen(open);
  };

  return (
    <ConversationContext.Provider
      key={conversationId}
      value={{
        _id: conversationId,
        content: conversationDetail?.content || '',
        createdAt: conversationDetail?.createdAt || '',
        updatedAt: conversationDetail?.updatedAt || '',
        customer: {
          _id: customer?._id || '',
          firstName: customer?.firstName || '',
          lastName: customer?.lastName || '',
          avatar: customer?.avatar || '',
        },
        integration: {
          _id: integration?._id || '',
          name: integration?.name || '',
          kind: integration?.kind || '',
          channelId: integration?.channelId || '',
          channel: integration?.channel || null,
        },
      }}
    >
      <Sheet open={open} onOpenChange={handleOpen}>
        <Sheet.Trigger>
          <ConversationRelationItem
            conversationId={conversationId}
            customer={customer || ({} as ICustomerInline)}
            integration={integration || ({} as IIntegration)}
            createdAt={createdAt || ''}
            updatedAt={updatedAt || ''}
            channelDetail={channelDetail || ({} as IChannel)}
          />
        </Sheet.Trigger>
        <Sheet.View>
          <Sheet.Header>
            <Sheet.Title>Conversation Details</Sheet.Title>
            <Sheet.Close />
          </Sheet.Header>
          <Sheet.Content>
            <Suspense fallback={<Spinner containerClassName="h-full" />}>
              {open && (
                <ConversationDetailView conversationId={conversationId} />
              )}
            </Suspense>
          </Sheet.Content>
        </Sheet.View>
      </Sheet>
    </ConversationContext.Provider>
  );
};

export const ConversationItemContent = () => {
  const { content } = useConversationContext();
  if (!content) return null;

  if (content.includes('callDirection/')) {
    const callDirection = content.split('callDirection/')[1];

    return (
      <div className="font-medium">
        {callDirection === 'INCOMING' ? 'Incoming Call' : 'Outgoing Call'}
      </div>
    );
  }

  return (
    <div className="[&_*]:truncate [&_*]:text-left text-accent-foreground w-full h-4 [&_*]:text-sm [&_*]:leading-tight [&_*]:font-medium">
      <BlockEditorReadOnly content={content} />
    </div>
  );
};

export const ConversationRelationItem = ({
  conversationId,
  customer,
  integration,
  createdAt,
  updatedAt,
  channelDetail,
}: {
  conversationId: string;
  customer: ICustomerInline;
  integration: IIntegration;
  createdAt: string;
  updatedAt: string;
  channelDetail: IChannel;
}) => {
  return (
    <Card className="bg-background">
      <Button
        variant={'ghost'}
        size="lg"
        className={cn(
          'flex rounded-lg h-10 justify-start px-4 gap-3 hover:bg-primary/5 hover:text-foreground w-full',
          'font-medium text-foreground',
          'p-4 pl-6 h-auto overflow-hidden flex-col items-start cursor-pointer',
        )}
      >
        <CustomersInline.Provider customers={customer ? [customer] : []}>
          <div className="flex w-full gap-3 leading-tight">
            <div
              className={cn(
                'group grid place-items-center relative size-6',
                conversationId && 'size-8',
              )}
            >
              <div className="relative">
                <CustomersInline.Avatar
                  size={conversationId ? 'xl' : 'lg'}
                  className=""
                />
                <ConversationIntegrationBadge
                  integrationId={integration?._id}
                />
              </div>
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center">
                <CustomersInline.Title className="truncate" />
                <div className="ml-auto text-accent-foreground">
                  {createdAt && (
                    <Tooltip>
                      <Tooltip.Trigger>
                        <RelativeDateDisplay.Value
                          value={updatedAt || createdAt}
                          isShort
                        />
                      </Tooltip.Trigger>
                      <Tooltip.Content>
                        {format(
                          new Date(updatedAt || createdAt),
                          'MMM dd, yyyy HH:mm',
                        )}
                      </Tooltip.Content>
                    </Tooltip>
                  )}
                </div>
              </div>
              <div className="w-auto text-left flex-none truncate flex text-primary items-center gap-1 text-xs">
                {channelDetail && (
                  <IconComponent
                    name={channelDetail?.icon}
                    className="size-3"
                  />
                )}
                {channelDetail && (
                  <span title={channelDetail.name}>{channelDetail.name}</span>
                )}
              </div>
            </div>
          </div>
          <ConversationItemContent />
        </CustomersInline.Provider>
      </Button>
    </Card>
  );
};

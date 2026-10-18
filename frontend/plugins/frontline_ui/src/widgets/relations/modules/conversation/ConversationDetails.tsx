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
import { useTranslation } from 'react-i18next';
import { CustomersInline, ICustomerInline } from 'ui-modules';
import { useConversationContext } from '@/inbox/conversations/hooks/useConversationContext';
import { useChannelInline } from '@/inbox/channel/hooks/useChannelInline';
import { ConversationIntegrationBadge } from '@/integrations/components/IntegrationBadge';
import { format } from 'date-fns';
import { Suspense, useState } from 'react';
import { compactList } from '@/shared/utils/cursorList';
import { ConversationContext } from '@/inbox/conversations/context/ConversationContext';
import { ConversationDetailView } from './ConversationDetailView';
import type { ChannelInlineQuery } from '~/gql/graphql';
import { toCustomerInline } from '@/inbox/conversations/utils/conversationContext';
import { IntegrationType } from '@/types/Integration';
import {
  CALL_STATUS_LABEL_KEYS,
  parseCallConversationContent,
} from '@/integrations/call/utils/callContentUtils';

export const ConversationRelationDetails = ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);
  const [, setConversationId] = useQueryState<string>('relatedConversationId');
  const { conversationDetail } = useConversationDetail({
    variables: {
      _id: conversationId,
    },
  });
  const { customer, createdAt, integration, updatedAt, tagIds } =
    conversationDetail || {};
  const { channelId } = integration || {};
  const { channelDetail } = useChannelInline({
    variables: channelId ? { id: channelId } : undefined,
    skip: !channelId,
  });
  const customerInline = toCustomerInline(customer);

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
        customer: customerInline,
        tagIds: compactList(tagIds),
      }}
    >
      <Sheet open={open} onOpenChange={handleOpen}>
        <Sheet.Trigger>
          <ConversationRelationItem
            conversationId={conversationId}
            customer={customerInline}
            integrationId={integration?._id}
            createdAt={createdAt || ''}
            updatedAt={updatedAt || ''}
            channelDetail={channelDetail}
          />
        </Sheet.Trigger>
        <Sheet.View>
          <Sheet.Header>
            <Sheet.Title>
              {t('conversation-details', 'Conversation Details')}
            </Sheet.Title>
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
  const { t } = useTranslation('frontline');
  const { content, integration } = useConversationContext();
  if (!content) return null;

  const callContent =
    integration?.kind === IntegrationType.CALL ||
    content.includes('callDirection/')
      ? parseCallConversationContent(content)
      : null;

  if (callContent) {
    const { direction, status } = callContent;
    return (
      <div className="font-medium">
        {direction === 'incoming'
          ? t('incoming-call', 'Incoming Call')
          : t('outgoing-call', 'Outgoing Call')}
        {status ? ` · ${t(CALL_STATUS_LABEL_KEYS[status])}` : ''}
      </div>
    );
  }

  return (
    <div className="**:truncate **:text-left text-accent-foreground w-full h-4 **:text-sm **:leading-tight **:font-medium">
      <BlockEditorReadOnly content={content} />
    </div>
  );
};

export const ConversationRelationItem = ({
  conversationId,
  customer,
  integrationId,
  createdAt,
  updatedAt,
  channelDetail,
}: {
  conversationId: string;
  customer?: ICustomerInline;
  integrationId?: string;
  createdAt: string;
  updatedAt: string;
  channelDetail?: ChannelInlineQuery['getChannel'];
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
                <ConversationIntegrationBadge integrationId={integrationId} />
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
                    name={channelDetail.icon ?? undefined}
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

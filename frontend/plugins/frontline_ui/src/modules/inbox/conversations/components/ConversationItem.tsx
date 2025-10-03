import {
  BlockEditorReadOnly,
  Button,
  Checkbox,
  cn,
  RelativeDateDisplay,
  useMultiQueryState,
  useQueryState,
} from 'erxes-ui';
import { useConversationContext } from '../hooks/useConversationContext';
import { useIntegrationInline } from '@/integrations/hooks/useIntegrations';
import { BrandsInline, currentUserState, CustomersInline } from 'ui-modules';
import { useAtomValue, useSetAtom } from 'jotai';
import { activeConversationState } from '../states/activeConversationState';
import { ConversationIntegrationBadge } from '@/integrations/components/IntegrationBadge';
import { useEffect, useState } from 'react';
import {
  selectConversationsState,
  setSelectConversationsState,
} from '../states/selectConversationsState';
import { inboxLayoutState } from '@/inbox/states/inboxLayoutState';

export const ConversationItem = ({
  onConversationSelect,
}: {
  onConversationSelect: () => void;
}) => {
  const inboxLayout = useAtomValue(inboxLayoutState);

  const { createdAt, updatedAt, customer, integrationId } =
    useConversationContext();

  const { integration } = useIntegrationInline({
    variables: {
      _id: integrationId,
    },
  });
  const { brandId } = integration || {};

  if (inboxLayout === 'split') {
    return (
      <ConversationContainer
        className="p-4 pl-6 h-auto overflow-hidden flex-col items-start cursor-pointer"
        onConversationSelect={onConversationSelect}
      >
        <CustomersInline.Provider customers={customer ? [customer] : []}>
          <div className="flex w-full gap-3 leading-tight">
            <ConversationSelector />
            <div className="flex-1 space-y-1">
              <div className="flex gap-1 items-center">
                <CustomersInline.Title className="truncate" />
                <div className="ml-auto text-accent-foreground">
                  {createdAt && (
                    <RelativeDateDisplay.Value value={updatedAt || createdAt} />
                  )}
                </div>
              </div>
              <div className="font-normal text-accent-foreground text-xs">
                <BrandsInline
                  brandIds={[brandId || '']}
                  placeholder={brandId ? 'brand not found' : 'no brand'}
                />
              </div>
            </div>
          </div>
          <ConversationItemContent />
        </CustomersInline.Provider>
      </ConversationContainer>
    );
  }

  return (
    <ConversationContainer onConversationSelect={onConversationSelect}>
      <CustomersInline.Provider customers={customer ? [customer] : []}>
        <ConversationSelector />
        <CustomersInline.Title className="w-56 truncate flex-none text-foreground" />
        <ConversationItemContent />
        <div className="ml-auto font-medium text-accent-foreground w-32 truncate flex-none">
          to <BrandsInline brandIds={[brandId || '']} />
        </div>
        <div className="w-32 text-right flex-none">
          {createdAt && (
            <RelativeDateDisplay value={updatedAt || createdAt}>
              <RelativeDateDisplay.Value value={updatedAt || createdAt} />
            </RelativeDateDisplay>
          )}
        </div>
      </CustomersInline.Provider>
    </ConversationContainer>
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
    <div className="truncate w-full h-4 [&_*]:text-sm [&_*]:leading-tight [&_*]:font-medium">
      <BlockEditorReadOnly content={content} />
    </div>
  );
};

const ConversationContainer = ({
  children,
  className,
  onConversationSelect,
}: {
  children: React.ReactNode;
  className?: string;
  onConversationSelect?: () => void;
}) => {
  const [{ conversationId }, setValues] = useMultiQueryState<{
    conversationId: string;
  }>(['conversationId']);
  const setActiveConversation = useSetAtom(activeConversationState);
  const { loading, integration, ...conversation } = useConversationContext();
  const { _id, readUserIds } = conversation || {};
  const currentUser = useAtomValue(currentUserState);
  const isRead = readUserIds?.includes(currentUser?._id || '');

  return (
    <Button
      key={_id}
      variant={isRead ? 'secondary' : 'ghost'}
      size="lg"
      className={cn(
        'flex rounded-none h-10 justify-start px-4 gap-3 hover:bg-primary/5 hover:text-foreground w-full',
        className,
        isRead && 'font-medium text-muted-foreground',
        conversationId === _id &&
          'bg-primary/10 text-foreground hover:bg-primary/10',
      )}
      asChild
      onClick={() => {
        conversation && setActiveConversation(conversation);
        setValues({
          conversationId: _id,
        });
        onConversationSelect?.();
      }}
    >
      <div>{children}</div>
    </Button>
  );
};

const ConversationSelector = () => {
  const [conversationId] = useQueryState<string>('conversationId');
  const { integrationId } = useConversationContext();

  return (
    <div
      className={cn(
        'group grid place-items-center relative size-6',
        conversationId && 'size-8',
      )}
    >
      <div className="absolute size-full bg-primary/10 rounded-full" />
      <ConversationCheckbox />
      <div className="transition-opacity duration-200 relative opacity-100 group-hover:opacity-0 peer-data-[state=checked]:opacity-0">
        <CustomersInline.Avatar
          size={conversationId ? 'xl' : 'lg'}
          className=""
        />
        <ConversationIntegrationBadge integrationId={integrationId} />
      </div>
    </div>
  );
};

const ConversationCheckbox = () => {
  const { _id } = useConversationContext();
  const [isChecked, setIsChecked] = useState(false);
  const setSelectConversations = useSetAtom(setSelectConversationsState);

  return (
    <>
      <Checkbox
        checked={isChecked}
        className="absolute transition-opacity duration-200 opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100 z-10"
        onClick={(e) => e.stopPropagation()}
        onCheckedChange={() => setSelectConversations(_id || '')}
      />
      <ConversationCheckedEffect
        isChecked={isChecked}
        setIsChecked={setIsChecked}
      />
    </>
  );
};

const ConversationCheckedEffect = ({
  isChecked,
  setIsChecked,
}: {
  isChecked: boolean;
  setIsChecked: (isChecked: boolean) => void;
}) => {
  const { _id } = useConversationContext();
  const selectConversations = useAtomValue(selectConversationsState);

  useEffect(() => {
    if (isChecked !== selectConversations.includes(_id || '')) {
      setIsChecked(selectConversations.includes(_id || ''));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectConversations]);

  return null;
};

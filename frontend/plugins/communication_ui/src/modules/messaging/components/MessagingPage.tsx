import { useCallback } from 'react';
import { IconLock, IconMessages, IconShieldCheck } from '@tabler/icons-react';
import {
  Alert,
  Badge,
  Breadcrumb,
  Empty,
  PageContainer,
  useQueryState,
} from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import type { MessagingKind, SelectedConversation } from '../types';
import { ConversationList } from './ConversationList';
import { ConversationPanel } from './ConversationPanel';

const asText = (value: unknown) =>
  value === null || value === undefined || value === '' ? null : String(value);

/** Read-only staff oversight of every app conversation in the organization. */
export const MessagingPage = ({
  sampleData = false,
}: {
  sampleData?: boolean;
}) => {
  const [kindParam, setKind] = useQueryState<string>('kind');
  const [appParam, setApp] = useQueryState<string>('app');
  const [searchParam, setSearch] = useQueryState<string>('searchValue');
  const [conversationParam, setConversation] =
    useQueryState<string>('conversationId');
  const [conversationAppParam, setConversationApp] =
    useQueryState<string>('conversationApp');

  const kind: MessagingKind = kindParam === 'GROUP' ? 'GROUP' : 'DIRECT';
  const appKey = asText(appParam);
  const search = asText(searchParam) ?? '';
  const conversationId = asText(conversationParam);
  const conversationApp = asText(conversationAppParam);
  const selected: SelectedConversation | null =
    conversationId && conversationApp
      ? { appKey: conversationApp, id: conversationId }
      : null;

  const onSearchChange = useCallback(
    (value: string) => setSearch(value || null),
    [setSearch],
  );

  const onSelect = (conversation: SelectedConversation) => {
    setConversationApp(conversation.appKey);
    setConversation(conversation.id);
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Breadcrumb.Page className="flex items-center gap-2">
                  <IconMessages />
                  Messaging
                </Breadcrumb.Page>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
        <PageHeader.End>
          {sampleData && <Badge variant="secondary">Sample data</Badge>}
          <Badge variant="warning" className="gap-1">
            <IconLock className="size-3.5" />
            Read-only
          </Badge>
        </PageHeader.End>
      </PageHeader>
      <div className="flex min-h-0 flex-1 flex-col">
        <Alert className="rounded-none border-x-0 border-t-0">
          <IconShieldCheck />
          <Alert.Title>Administrative oversight</Alert.Title>
          <Alert.Description>
            You are viewing private conversations as an administrator, not as a
            participant. Nothing here sends messages or changes members, unread
            counts or read receipts, and participants are not notified.
            Conversation access is recorded in the system log.
          </Alert.Description>
        </Alert>
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <aside className="flex min-h-0 w-full shrink-0 flex-col border-b md:w-96 md:border-b-0 md:border-r">
            <ConversationList
              kind={kind}
              onKindChange={(value) => setKind(value)}
              appKey={appKey}
              onAppKeyChange={(value) => setApp(value)}
              search={search}
              onSearchChange={onSearchChange}
              selected={selected}
              onSelect={onSelect}
            />
          </aside>
          <section className="flex min-h-0 min-w-0 flex-1 flex-col">
            {selected ? (
              <ConversationPanel selected={selected} />
            ) : (
              <Empty className="flex-1">
                <Empty.Header>
                  <Empty.Media variant="icon">
                    <IconMessages />
                  </Empty.Media>
                  <Empty.Title>Select a conversation</Empty.Title>
                  <Empty.Description>
                    Choose a direct or group conversation to read its history
                    and members.
                  </Empty.Description>
                </Empty.Header>
              </Empty>
            )}
          </section>
        </div>
      </div>
    </PageContainer>
  );
};

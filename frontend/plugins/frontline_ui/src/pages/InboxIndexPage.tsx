import { IconInbox, IconSettings } from '@tabler/icons-react';
import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { InboxLayout } from '@/inbox/components/InboxLayout';
import { ConversationDetail } from '@/inbox/conversations/conversation-detail/components/ConversationDetail';
import { Conversations } from '@/inbox/conversations/components/Conversations';

const InboxIndexPage = () => {
  return (
    <div className="flex flex-col h-dvh">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/frontline/inbox">
                    <IconInbox />
                    Inbox
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton />
        </PageHeader.Start>
        <PageHeader.End>
          <Button variant="outline" asChild>
            <Link to="/settings/inbox">
              <IconSettings />
              Go to settings
            </Link>
          </Button>
        </PageHeader.End>
      </PageHeader>
      <InboxLayout
        conversations={<Conversations />}
        conversationDetail={<ConversationDetail />}
      />
    </div>
  );
};

export default InboxIndexPage;

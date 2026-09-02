import { IconMail } from '@tabler/icons-react';
import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { PageHeader, createFavoriteBreadcrumb } from 'ui-modules';
import { Link } from 'react-router-dom';
import { InboxLayout } from '@/inbox/components/InboxLayout';
import { ConversationDetail } from '@/inbox/conversations/conversation-detail/components/ConversationDetail';
import { Conversations } from '@/inbox/conversations/components/Conversations';
import { useTranslation } from 'react-i18next';

const InboxLink = ({ title }: { title: string }) => (
  <Button variant="ghost" asChild>
    <Link to="/frontline/inbox">
      <IconMail />
      {title}
    </Link>
  </Button>
);

const InboxBreadcrumb = ({ title }: { title: string }) => (
  <Breadcrumb>
    <Breadcrumb.List className="gap-1">
      <Breadcrumb.Item>
        <InboxLink title={title} />
      </Breadcrumb.Item>
    </Breadcrumb.List>
  </Breadcrumb>
);

const InboxPageHeader = ({ title }: { title: string }) => {
  const favoriteBreadcrumb = createFavoriteBreadcrumb('Frontline', title);

  return (
    <PageHeader>
      <PageHeader.Start>
        <InboxBreadcrumb title={title} />
        <Separator.Inline />
        <PageHeader.FavoriteToggleButton
          breadcrumb={favoriteBreadcrumb}
          icon="IconMail"
        />
      </PageHeader.Start>
    </PageHeader>
  );
};

const InboxIndexPage = () => {
  const { t } = useTranslation('frontline');
  const title = t('inbox');

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <InboxPageHeader title={title} />
      <InboxLayout
        conversations={<Conversations />}
        conversationDetail={<ConversationDetail />}
      />
    </div>
  );
};

export default InboxIndexPage;

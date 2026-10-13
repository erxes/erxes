import { InboxLayout } from '@/inbox/components/InboxLayout';
import { Conversations } from '@/inbox/conversations/components/Conversations';
import { ConversationDetail } from '@/inbox/conversations/conversation-detail/components/ConversationDetail';
import { IconMail, IconPencil } from '@tabler/icons-react';
import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  PageHeader,
  createFavoriteBreadcrumb,
  useComposeEmail,
} from 'ui-modules';

export const InboxIndexPage = () => {
  const { t } = useTranslation('frontline');
  const { canComposeEmail, composeEmail } = useComposeEmail();
  const favoriteBreadcrumb = createFavoriteBreadcrumb(
    'Frontline',
    t('team-inbox', 'Team inbox'),
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/frontline/inbox">
                    <IconMail />
                    {t('team-inbox', 'Team inbox')}
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton
            breadcrumb={favoriteBreadcrumb}
            icon="IconMail"
          />
        </PageHeader.Start>
        <PageHeader.End>
          {canComposeEmail && (
            <Button type="button" onClick={() => composeEmail()}>
              <IconPencil />
              Send email
            </Button>
          )}
        </PageHeader.End>
      </PageHeader>
      <InboxLayout
        conversations={<Conversations />}
        conversationDetail={<ConversationDetail />}
      />
    </div>
  );
};

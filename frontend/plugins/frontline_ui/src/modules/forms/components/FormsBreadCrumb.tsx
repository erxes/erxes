import { Button, Separator } from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';
import { IconMail, IconForms } from '@tabler/icons-react';
import { ChannelDetailBreadcrumb } from '@/channels/components/settings/breadcrumbs/ChannelDetailBreadcrumb';

export const FormsBreadCrumb = () => {
  const { channelId } = useParams<{ channelId: string }>();
  return (
    <>
      <Button variant="ghost" className="font-semibold" asChild>
        <Link to="/settings/frontline/channels">
          <IconMail className="w-4 h-4 text-accent-foreground" />
          Channels
        </Link>
      </Button>
      <Separator.Inline />
      <ChannelDetailBreadcrumb channelId={channelId} />
      <Separator.Inline />
      <Button variant="ghost" className="font-semibold" asChild>
        <Link to={`/settings/frontline/channels/${channelId}/forms`}>
          <IconForms />
          Forms
        </Link>
      </Button>
    </>
  );
};

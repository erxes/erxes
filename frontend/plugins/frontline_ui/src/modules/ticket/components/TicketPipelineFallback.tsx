import { IconBrandTrello, IconSettings } from '@tabler/icons-react';
import { Button, Empty, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export const TicketPipelineFallback = ({
  className,
}: {
  className?: string;
}) => {
  const { t } = useTranslation('frontline');
  const [channelId] = useQueryState<string | null>('channelId');
  return (
    <Empty className={clsx('m-3 flex-1 rounded-lg bg-sidebar', className)}>
      <Empty.Header>
        <Empty.Media>
          <IconBrandTrello />
        </Empty.Media>
        <Empty.Title>{t('no-pipeline-yet')}</Empty.Title>
        <Empty.Description>
          {t('create-pipeline-description')}
        </Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <Button variant="outline" asChild>
          <Link to={`/settings/frontline/channels/${channelId}/pipelines`}>
            <IconSettings />
            {t('manage-pipelines')}
          </Link>
        </Button>
      </Empty.Content>
    </Empty>
  );
};

import type { Broadcast } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconMail, IconMailOff, IconMessage, IconSpeakerphone } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { Button, PageHeader } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { useBroadcastHandlers } from '../broadcastQueries';

/** Starts a draft on the channel and opens it. */
const useNewBroadcast = () => {
  const { t } = useTranslation('broadcasts');
  const navigate = useNavigate();
  const { onError } = useBroadcastHandlers();

  const create = useMutation(
    orpc.broadcasts.create.mutationOptions({
      onSuccess: (broadcast) => navigate(paths.broadcasts.broadcast(broadcast.id)),
      onError,
    }),
  );

  return {
    pending: create.isPending,
    start: (channel: Broadcast['channel']) =>
      create.mutate({
        channel,
        name:
          channel === 'email'
            ? t('untitled-email', 'Untitled email')
            : t('untitled-sms', 'Untitled SMS'),
      }),
  };
};

const NewBroadcastButtons = () => {
  const { t } = useTranslation('broadcasts');
  const { pending, start } = useNewBroadcast();

  return (
    <>
      <Button variant="outline" disabled={pending} onClick={() => start('sms')}>
        <IconMessage />
        {t('new-sms', 'New SMS')}
      </Button>
      <Button disabled={pending} onClick={() => start('email')}>
        <IconMail />
        {t('new-email', 'New email')}
      </Button>
    </>
  );
};

export const BroadcastsListHeader = () => {
  const { t } = useTranslation('broadcasts');
  const can = useCan();

  return (
    <PageHeader>
      <PageHeader.Start variant="flush">
        <AppBreadcrumb
          items={[
            { label: t('title', 'Broadcasts'), to: paths.broadcasts.list, icon: IconSpeakerphone },
          ]}
        />
      </PageHeader.Start>
      <PageHeader.End>
        <Button
          variant="ghost"
          nativeButton={false}
          render={<Link to={paths.broadcasts.suppressions} />}
        >
          <IconMailOff />
          {t('suppressions', 'Suppressed addresses')}
        </Button>
        {can('broadcasts.manage') && <NewBroadcastButtons />}
      </PageHeader.End>
    </PageHeader>
  );
};

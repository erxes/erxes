import { IconSpeakerphone } from '@tabler/icons-react';
import { Empty } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useCan } from '~/modules/auth/session';
import { NewBroadcastButtons } from './BroadcastsListHeader';

/** No broadcasts at all yet: what they are for, and the way to write the first. */
export const NoBroadcasts = () => {
  const { t } = useTranslation('broadcasts');
  const manage = useCan()('broadcasts.manage');

  return (
    <Empty className="absolute inset-x-0 top-1/4">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconSpeakerphone />
        </Empty.Media>
        <Empty.Title>{t('empty', 'No broadcasts yet')}</Empty.Title>
        <Empty.Description>
          {t(
            'empty-description',
            'Write one email or SMS and send it to a saved view of customers, a filter, or everyone.',
          )}
        </Empty.Description>
      </Empty.Header>
      {manage && (
        <Empty.Content className="flex-row justify-center">
          <NewBroadcastButtons />
        </Empty.Content>
      )}
    </Empty>
  );
};

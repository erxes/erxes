import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PollSheet } from '@/poll/components/poll-page/PollSheet';

const PollsCreateButton: FC<React.ComponentProps<typeof Button>> = (props) => {
  const { t } = useTranslation('frontline');
  const { id: channelId } = useParams<{ id: string }>();

  return (
    <PollSheet
      channelId={channelId}
      trigger={
        <Button {...props}>
          <IconPlus />
          {t('create-poll')}
        </Button>
      }
    />
  );
};

export { PollsCreateButton };

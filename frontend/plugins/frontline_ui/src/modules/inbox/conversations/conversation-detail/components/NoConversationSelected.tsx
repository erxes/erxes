import { IconMessages } from '@tabler/icons-react';
import { Empty } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const NoConversationSelected = () => {
  const { t } = useTranslation('frontline');
  return (
    <Empty className="h-full rounded-none border-0 bg-muted/20">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconMessages />
        </Empty.Media>
        <Empty.Title>{t('no-conversations-selected')}</Empty.Title>
        <Empty.Description>
          {t('select-conversation-to-view')}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

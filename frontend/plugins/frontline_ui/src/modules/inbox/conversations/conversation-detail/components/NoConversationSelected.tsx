import { IconCircleMinus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const NoConversationSelected = () => {
  const { t } = useTranslation('frontline');
  return (
    <div className="h-full w-full flex flex-col items-center justify-center">
      <div className="size-28 bg-sidebar rounded-2xl border border-dashed flex items-center justify-center">
        <IconCircleMinus size={64} className="text-scroll" stroke={1} />
      </div>
      <div className="font-medium mt-5 text-muted-foreground">
        {t('no-conversations-selected')}
      </div>
      <div className="text-accent-foreground mt-2">
        {t('select-conversation-to-view')}
      </div>
    </div>
  );
};

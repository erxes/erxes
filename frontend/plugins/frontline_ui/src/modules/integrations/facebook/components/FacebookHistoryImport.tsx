import { IIntegration } from '@/integrations/types/Integration';
import { IconDownload } from '@tabler/icons-react';
import { Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useFacebookHistoryImport } from '@/integrations/facebook/hooks/useFacebookHistoryImport';

type Props = {
  integration: IIntegration;
};

export const FacebookHistoryImport = ({ integration }: Props) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const { status, isActive, startImport, loading } = useFacebookHistoryImport(
    integration._id,
  );
  const busy = isActive || loading;

  const handleClick = () => {
    if (!busy) {
      startImport();
    }
  };

  const label = isActive
    ? t('import-history-running', {
        defaultValue:
          'Importing history: {{conversations}} conversations, {{messages}} messages',
        conversations: status?.conversations ?? 0,
        messages: status?.messages ?? 0,
      })
    : t('import-history', 'Import message history');

  return (
    <div onClick={handleClick} className="flex items-center gap-2 w-full">
      {busy ? (
        <Spinner className="size-4 text-primary" />
      ) : (
        <IconDownload size={16} />
      )}
      <span className="truncate">{label}</span>
    </div>
  );
};

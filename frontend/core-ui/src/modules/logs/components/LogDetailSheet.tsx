import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { LogDetailView } from '@/logs/components/LogDetailView';
import { useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export function LogDetailSheet() {
  const { t } = useTranslation('common', { keyPrefix: 'logs' });
  const [logId, setLogId] = useQueryState<string>('logId');

  return (
    <CoreModulePanel
      name={'logs/LogDetailSheet'}
      open={!!logId}
      onOpenChange={(open) => !open && logId && setLogId(null)}
    >
      <CoreModulePanel.View className="md:w-[calc(100vw-1rem)] flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none sm:max-w-4xl">
        <CoreModulePanel.Header>
          <CoreModulePanel.Title>{t('log-details')}</CoreModulePanel.Title>
          <CoreModulePanel.Close />
        </CoreModulePanel.Header>
        <CoreModulePanel.Content className="flex-1 min-h-0 overflow-hidden">
          {logId && <LogDetailView logId={logId} />}
        </CoreModulePanel.Content>
      </CoreModulePanel.View>
    </CoreModulePanel>
  );
}

import { useAutomationRefetch } from '@/automations/hooks/useAutomationRefetch';
import { IconRefresh } from '@tabler/icons-react';
import { Button, Spinner, Tooltip } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AutomationRefetchButton = ({
  disabled,
}: {
  disabled?: boolean;
}) => {
  const { t } = useTranslation('automations');
  const { canRefetch, refetching, handleRefetch } = useAutomationRefetch();

  if (!canRefetch) {
    return null;
  }

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Button
            variant="outline"
            size="icon"
            disabled={disabled || refetching}
            onClick={handleRefetch}
          >
            {refetching ? <Spinner /> : <IconRefresh />}
            <span className="sr-only">{t('refetch-latest')}</span>
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>{t('refetch-latest')}</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

import { Badge, Tooltip } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AutomationExecutionActionResultProps } from 'ui-modules';

export const AutomationHistoryResult = ({
  result,
}: AutomationExecutionActionResultProps) => {
  const { t } = useTranslation('frontline');
  if (result?.error) {
    return (
      <Tooltip.Provider>
        <Tooltip>
          <Tooltip.Trigger>
            <Badge variant="destructive">{t('error')}</Badge>
          </Tooltip.Trigger>
        </Tooltip>
      </Tooltip.Provider>
    );
  }

  return <Badge variant="success">{t('sent-successfully')}</Badge>;
};

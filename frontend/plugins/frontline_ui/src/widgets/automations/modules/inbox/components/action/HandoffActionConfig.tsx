import { useTranslation } from 'react-i18next';
import { AutomationActionNodeConfigProps } from 'ui-modules';
import { THandoffActionForm } from '../../states/handoffActionForm';

export const HandoffActionConfig = ({
  config,
}: AutomationActionNodeConfigProps<THandoffActionForm>) => {
  const { t } = useTranslation('frontline');
  const minutes = config?.pauseMinutes || '30';

  return (
    <div className="flex flex-col gap-1 text-xs">
      <p>
        {t('pause-time')}: {minutes} {t('minutes')}
      </p>
      {config?.assignTo ? (
        <p className="truncate text-muted-foreground">
          {t('assign-to')}: {config.assignTo}
        </p>
      ) : null}
    </div>
  );
};

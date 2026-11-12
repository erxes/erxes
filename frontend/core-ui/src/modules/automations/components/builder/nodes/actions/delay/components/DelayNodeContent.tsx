import { useTranslation } from 'react-i18next';
import { TDelayConfigForm } from '@/automations/components/builder/nodes/actions/delay/states/delayConfigForm';
import { AutomationNodeMetaInfoRow } from 'ui-modules';
import { NodeContentComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';

export const DelayNodeContent = ({
  config,
}: NodeContentComponentProps<TDelayConfigForm>) => {
  const { t } = useTranslation('automations');
  const { value, type, workingTime } = config || {};
  const suffix = workingTime
    ? ` · ${t('delay-working-hours-short', { defaultValue: 'working hours' })}`
    : '';

  return (
    <AutomationNodeMetaInfoRow
      fieldName={t('delay-for')}
      content={`${value} ${type}s${suffix}`}
    />
  );
};

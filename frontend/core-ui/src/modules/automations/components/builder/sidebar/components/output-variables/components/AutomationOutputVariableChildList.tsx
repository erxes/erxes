import { Badge } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TAutomationOutputVariable } from '../AutomationVariableBrowserTypes';
import { useAutomationVariableCardProps } from '../hooks/useAutomationVariableCardProps';
import { AutomationOutputVariableCard } from './AutomationOutputVariableCard';
import { AutomationVariableBrowserEmptyState } from './AutomationVariableBrowserEmptyState';
import { AutomationVariableBrowserLoadingState } from './AutomationVariableBrowserLoadingState';

const AutomationOutputVariableChildItem = ({
  parentKey,
  variable,
}: {
  parentKey: string;
  variable: TAutomationOutputVariable;
}) => {
  const { t } = useTranslation('automations');
  const cardProps = useAutomationVariableCardProps({
    variableKey: `${parentKey}.${variable.key}`,
    label: variable.label,
  });

  return (
    <AutomationOutputVariableCard
      {...cardProps}
      badge={
        variable.exposure === 'reference' ? (
          <Badge variant="secondary">{t('reference', 'Reference')}</Badge>
        ) : undefined
      }
    />
  );
};

export const AutomationOutputVariableChildList = ({
  fields,
  loading,
  parentKey,
}: {
  fields: TAutomationOutputVariable[];
  loading: boolean;
  parentKey: string;
}) => {
  const { t } = useTranslation('automations');
  if (loading) {
    return (
      <AutomationVariableBrowserLoadingState
        text={t('loading-reference-fields', 'Loading reference fields...')}
      />
    );
  }

  if (!fields.length) {
    return (
      <AutomationVariableBrowserEmptyState
        text={t('no-reference-fields-available', 'No reference fields available.')}
      />
    );
  }

  return (
    <>
      {fields.map((field) => (
        <AutomationOutputVariableChildItem
          key={`${parentKey}.${field.key}`}
          parentKey={parentKey}
          variable={field}
        />
      ))}
    </>
  );
};

import { Badge } from 'erxes-ui';
import { TAutomationOutputVariable } from '../AutomationVariableBrowserTypes';
import { useAutomationVariableCardProps } from '../hooks/useAutomationVariableCardProps';
import { AutomationOutputVariableCard } from './AutomationOutputVariableCard';
import { AutomationVariableBrowserEmptyState } from './AutomationVariableBrowserEmptyState';
import { AutomationVariableBrowserLoadingState } from './AutomationVariableBrowserLoadingState';
import { useTranslation } from 'react-i18next';

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
    isLink: variable.isLink,
  });

  return (
    <AutomationOutputVariableCard
      {...cardProps}
      badge={
        variable.exposure === 'reference' ? (
          <Badge variant="secondary">{t('sidebar-reference')}</Badge>
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
        text={t('sidebar-loading-reference-fields')}
      />
    );
  }

  if (!fields.length) {
    return (
      <AutomationVariableBrowserEmptyState
        text={t('sidebar-no-reference-fields')}
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

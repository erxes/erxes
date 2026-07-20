import { Badge } from 'erxes-ui';
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
  const cardProps = useAutomationVariableCardProps({
    variableKey: `${parentKey}.${variable.key}`,
    label: variable.label,
  });

  return (
    <AutomationOutputVariableCard
      {...cardProps}
      badge={
        variable.exposure === 'reference' ? (
          <Badge variant="secondary">Reference</Badge>
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
  if (loading) {
    return (
      <AutomationVariableBrowserLoadingState text="Loading reference fields..." />
    );
  }

  if (!fields.length) {
    return (
      <AutomationVariableBrowserEmptyState text="No reference fields available." />
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

import { Button, Command } from 'erxes-ui';
import { TAutomationOutputVariable } from '../AutomationVariableBrowserTypes';
import { useAutomationVariableCardProps } from '../hooks/useAutomationVariableCardProps';
import { useAutomationVariableExpansion } from '../hooks/useAutomationVariableExpansion';
import { AutomationOutputVariableCard } from './AutomationOutputVariableCard';
import { AutomationOutputVariableChildList } from './AutomationOutputVariableChildList';

export const AutomationOutputVariableItem = ({
  variable,
}: {
  variable: TAutomationOutputVariable;
}) => {
  const cardProps = useAutomationVariableCardProps({
    variableKey: variable.key,
    label: variable.label,
  });
  const {
    childFields,
    expandLabel,
    expanded,
    isExpandable,
    loading,
    toggleExpanded,
  } = useAutomationVariableExpansion(variable);

  return (
    <Command.Item
      value={variable.key}
      keywords={[variable.label]}
      className="block h-auto space-y-2 p-0 data-[selected=true]:bg-transparent"
    >
      <AutomationOutputVariableCard
        {...cardProps}
        badge={
          isExpandable ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-7 px-2"
              onClick={toggleExpanded}
            >
              {expandLabel}
            </Button>
          ) : undefined
        }
      />

      {expanded ? (
        <div className="ml-3 space-y-2 border-l pl-3">
          <AutomationOutputVariableChildList
            parentKey={variable.key}
            fields={childFields}
            loading={loading}
          />
        </div>
      ) : null}
    </Command.Item>
  );
};

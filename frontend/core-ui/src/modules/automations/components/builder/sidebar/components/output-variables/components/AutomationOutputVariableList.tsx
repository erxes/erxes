import { Badge, Spinner } from 'erxes-ui';
import {
  setAutomationVariableDragData,
  TAutomationVariableDragPayload,
} from 'ui-modules';
import {
  TAutomationOutputVariable,
  TAutomationVariablePayloadBuilder,
} from '../AutomationVariableBrowserTypes';
import { AutomationVariableBrowserEmptyState } from './AutomationVariableBrowserEmptyState';
import { AutomationOutputVariableCard } from './AutomationOutputVariableCard';

export const AutomationOutputVariableList = ({
  buildVariablePath,
  buildVariablePayload,
  buildVariableToken,
  loading,
  onInsertVariable,
  searchQuery,
  variables,
}: {
  buildVariablePath: (path: string) => string;
  buildVariablePayload: TAutomationVariablePayloadBuilder;
  buildVariableToken: (path: string) => string;
  loading: boolean;
  onInsertVariable?: (payload: TAutomationVariableDragPayload) => void;
  searchQuery: string;
  variables: TAutomationOutputVariable[];
}) => {
  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-muted-foreground">
        <Spinner size="sm" />
        Loading outputs...
      </div>
    );
  }

  if (variables.length === 0) {
    return (
      <AutomationVariableBrowserEmptyState
        text={
          searchQuery
            ? 'No matching output variables.'
            : 'No output variables available.'
        }
      />
    );
  }

  return (
    <div className="space-y-2">
      {variables.map((variable) => {
        const path = buildVariablePath(variable.key);
        const token = buildVariableToken(variable.key);
        const payload = buildVariablePayload({
          key: variable.key,
          label: variable.label,
          path,
          token,
        });

        return (
          <AutomationOutputVariableCard
            key={variable.key}
            title={variable.label}
            path={path}
            token={token}
            badge={
              variable.exposure === 'reference' ? (
                <Badge variant="secondary">Reference</Badge>
              ) : undefined
            }
            onClick={
              onInsertVariable ? () => onInsertVariable(payload) : undefined
            }
            onDragStart={(event) => {
              setAutomationVariableDragData(event.dataTransfer, payload);
            }}
          />
        );
      })}
    </div>
  );
};

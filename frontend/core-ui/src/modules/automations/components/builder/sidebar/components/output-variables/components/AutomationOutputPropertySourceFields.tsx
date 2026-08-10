import { Spinner } from 'erxes-ui';
import {
  TAutomationVariableDragPayload,
  useFields,
  IField,
  setAutomationVariableDragData,
} from 'ui-modules';
import { AutomationOutputVariableCard } from './AutomationOutputVariableCard';
import { AutomationVariableBrowserEmptyState } from './AutomationVariableBrowserEmptyState';
import {
  TAutomationOutputPropertySource,
  TAutomationVariablePayloadBuilder,
} from '../AutomationVariableBrowserTypes';

export const AutomationOutputPropertySourceFields = ({
  source,
  searchQuery,
  buildVariablePath,
  buildVariableToken,
  buildVariablePayload,
  onInsertVariable,
}: {
  source: TAutomationOutputPropertySource;
  searchQuery: string;
  buildVariablePath: (path: string) => string;
  buildVariableToken: (path: string) => string;
  buildVariablePayload: TAutomationVariablePayloadBuilder;
  onInsertVariable?: (payload: TAutomationVariableDragPayload) => void;
}) => {
  const { fields, loading } = useFields({
    contentType: source.propertyType,
  });
  const filteredFields = !searchQuery
    ? fields
    : fields.filter((field) =>
        `${field.name} ${field.code}`.toLowerCase().includes(searchQuery),
      );

  return (
    <div className="space-y-2 rounded-md border bg-background p-3">
      <div className="font-medium text-foreground">{source.label}</div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-muted-foreground">
          <Spinner size="sm" />
          Loading property fields...
        </div>
      ) : filteredFields.length > 0 ? (
        <div className="space-y-2">
          {filteredFields.map((field: IField) => {
            const fieldKey = field.name || field.code || field._id;
            const path = buildVariablePath(`${source.key}.${fieldKey}`);
            const token = buildVariableToken(`${source.key}.${fieldKey}`);
            const payload = buildVariablePayload({
              key: `${source.key}.${fieldKey}`,
              label: field.name || fieldKey,
              path,
              token,
            });

            return (
              <AutomationOutputVariableCard
                key={field._id}
                title={field.name}
                path={path}
                token={token}
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
      ) : (
        <AutomationVariableBrowserEmptyState
          text={
            searchQuery
              ? 'No matching property fields.'
              : 'No property fields available.'
          }
        />
      )}
    </div>
  );
};

import { AUTOMATION_REFERENCE_FIELDS } from '@/automations/graphql/automationQueries';
import { useLazyQuery } from '@apollo/client';
import { Badge, Button, Spinner } from 'erxes-ui';
import type React from 'react';
import { useState } from 'react';
import {
  setAutomationVariableDragData,
  TAutomationVariableDragPayload,
} from 'ui-modules';
import {
  TAutomationReferenceFieldsResponse,
  TAutomationOutputVariable,
  TAutomationVariablePayloadBuilder,
  TAutomationVariableSourceNode,
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
  sourceNode,
  variables,
}: {
  buildVariablePath: (path: string) => string;
  buildVariablePayload: TAutomationVariablePayloadBuilder;
  buildVariableToken: (path: string) => string;
  loading: boolean;
  onInsertVariable?: (payload: TAutomationVariableDragPayload) => void;
  searchQuery: string;
  sourceNode: TAutomationVariableSourceNode;
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
        return (
          <AutomationOutputVariableItem
            key={variable.key}
            buildVariablePath={buildVariablePath}
            buildVariablePayload={buildVariablePayload}
            buildVariableToken={buildVariableToken}
            onInsertVariable={onInsertVariable}
            sourceNode={sourceNode}
            variable={variable}
          />
        );
      })}
    </div>
  );
};

const AutomationOutputVariableItem = ({
  buildVariablePath,
  buildVariablePayload,
  buildVariableToken,
  onInsertVariable,
  sourceNode,
  variable,
}: {
  buildVariablePath: (path: string) => string;
  buildVariablePayload: TAutomationVariablePayloadBuilder;
  buildVariableToken: (path: string) => string;
  onInsertVariable?: (payload: TAutomationVariableDragPayload) => void;
  sourceNode: TAutomationVariableSourceNode;
  variable: TAutomationOutputVariable;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [loadReferenceFields, { data, loading }] =
    useLazyQuery<TAutomationReferenceFieldsResponse>(
      AUTOMATION_REFERENCE_FIELDS,
      {
        fetchPolicy: 'cache-first',
      },
    );
  const path = buildVariablePath(variable.key);
  const token = buildVariableToken(variable.key);
  const payload = buildVariablePayload({
    key: variable.key,
    label: variable.label,
    path,
    token,
  });
  const referenceField = variable.field || variable.key;
  const inlineReferenceFields = variable.referenceFields || [];
  const referenceFields = inlineReferenceFields.length
    ? inlineReferenceFields
    : data?.automationReferenceFields || [];

  const handleReferenceClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);

    if (nextExpanded && !inlineReferenceFields.length && !data && !loading) {
      loadReferenceFields({
        variables: {
          type: variable.sourceType || sourceNode.type,
          field: referenceField,
        },
      });
    }
  };

  return (
    <div className="space-y-2">
      <AutomationOutputVariableCard
        title={variable.label}
        path={path}
        token={token}
        badge={
          variable.exposure === 'reference' ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-7 px-2"
              onClick={handleReferenceClick}
            >
              {expanded ? 'Hide fields' : 'Reference'}
            </Button>
          ) : undefined
        }
        onClick={onInsertVariable ? () => onInsertVariable(payload) : undefined}
        onDragStart={(event) => {
          setAutomationVariableDragData(event.dataTransfer, payload);
        }}
      />

      {expanded ? (
        <div className="ml-3 space-y-2 border-l pl-3">
          {loading ? (
            <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-muted-foreground">
              <Spinner size="sm" />
              Loading reference fields...
            </div>
          ) : referenceFields.length ? (
            referenceFields.map((referenceVariable) => {
              const childKey = `${variable.key}.${referenceVariable.key}`;
              const childPath = buildVariablePath(childKey);
              const childToken = buildVariableToken(childKey);
              const childPayload = buildVariablePayload({
                key: childKey,
                label: referenceVariable.label,
                path: childPath,
                token: childToken,
              });

              return (
                <AutomationOutputVariableCard
                  key={childKey}
                  title={referenceVariable.label}
                  path={childPath}
                  token={childToken}
                  badge={
                    referenceVariable.exposure === 'reference' ? (
                      <Badge variant="secondary">Reference</Badge>
                    ) : undefined
                  }
                  onClick={
                    onInsertVariable
                      ? () => onInsertVariable(childPayload)
                      : undefined
                  }
                  onDragStart={(event) => {
                    setAutomationVariableDragData(
                      event.dataTransfer,
                      childPayload,
                    );
                  }}
                />
              );
            })
          ) : (
            <AutomationVariableBrowserEmptyState text="No reference fields available." />
          )}
        </div>
      ) : null}
    </div>
  );
};

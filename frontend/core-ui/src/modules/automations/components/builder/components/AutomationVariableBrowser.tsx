import { AUTOMATION_NODE_OUTPUT } from '@/automations/graphql/automationQueries';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { AutomationNodeType } from '@/automations/types';
import { useQuery } from '@apollo/client';
import { IconInfoCircle } from '@tabler/icons-react';
import { Badge, IconComponent, Input, Spinner, cn } from 'erxes-ui';
import { useDeferredValue, useEffect, useState } from 'react';
import {
  IField,
  setAutomationVariableDragData,
  TAutomationVariableDragPayload,
  useFields,
} from 'ui-modules';

type TAutomationOutputVariable = {
  key: string;
  label: string;
  exposure?: 'placeholder' | 'reference';
};

type TAutomationOutputPropertySource = {
  key: string;
  label: string;
  propertyType: string;
};

type TAutomationNodeOutput = {
  variables?: TAutomationOutputVariable[];
  propertySources?: TAutomationOutputPropertySource[];
};

type TAutomationNodeOutputResponse = {
  automationNodeOutput: TAutomationNodeOutput | null;
};

export type TAutomationVariableSourceNode = {
  id: string;
  type: string;
  nodeType: AutomationNodeType;
  label: string;
  icon?: string;
};

export type TAutomationVariableEmptyState = {
  title: string;
  description: string;
};

const SidebarSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      {children}
    </div>
  );
};

const EmptyState = ({ text }: { text: string }) => {
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-muted-foreground">
      {text}
    </div>
  );
};

const InfoState = ({ title, description }: TAutomationVariableEmptyState) => {
  return (
    <div className="rounded-md border border-dashed bg-background px-4 py-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <IconInfoCircle className="size-4" />
        </div>
        <div className="space-y-1">
          <div className="font-medium text-foreground">{title}</div>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
      </div>
    </div>
  );
};

const VariableCard = ({
  title,
  path,
  token,
  badge,
  onClick,
  onDragStart,
}: {
  title: string;
  path: string;
  token: string;
  badge?: React.ReactNode;
  onClick?: () => void;
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
}) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={cn(
        'rounded-md border bg-background px-3 py-2 active:cursor-grabbing',
        onClick ? 'cursor-pointer hover:border-primary/60' : 'cursor-grab',
      )}
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      title={token}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="font-medium text-foreground">{title}</div>
        {badge}
      </div>
      <div className="mt-1 break-all font-mono text-xs text-muted-foreground">
        {path}
      </div>
    </div>
  );
};

const SourceNodeItem = ({
  node,
  isSelected,
  onClick,
}: {
  node: TAutomationVariableSourceNode;
  isSelected: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-md border px-3 py-3 text-left transition-colors',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'bg-background hover:border-primary/50',
      )}
    >
      {node.icon ? (
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <IconComponent className="size-4" name={node.icon} />
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="truncate font-medium text-foreground">{node.label}</div>
        <div className="text-xs text-muted-foreground">
          {node.nodeType === AutomationNodeType.Trigger ? 'Trigger' : 'Action'}
        </div>
      </div>
    </button>
  );
};

const PropertySourceFields = ({
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
  buildVariablePayload: (args: {
    key: string;
    label: string;
    path: string;
    token: string;
  }) => TAutomationVariableDragPayload;
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
            const fieldKey = field.code || field.name || field._id;
            const path = buildVariablePath(`${source.key}.${fieldKey}`);
            const token = buildVariableToken(`${source.key}.${fieldKey}`);
            const payload = buildVariablePayload({
              key: `${source.key}.${fieldKey}`,
              label: field.name || fieldKey,
              path,
              token,
            });

            return (
              <VariableCard
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
        <EmptyState
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

export const AutomationVariableBrowser = ({
  sourceNode,
  sourceNodes,
  emptyState,
  onInsertVariable,
  sourceSectionTitle = 'Selected Node',
  className,
}: {
  sourceNode?: TAutomationVariableSourceNode | null;
  sourceNodes?: TAutomationVariableSourceNode[];
  emptyState?: TAutomationVariableEmptyState | null;
  onInsertVariable?: (payload: TAutomationVariableDragPayload) => void;
  sourceSectionTitle?: string;
  className?: string;
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedSourceNodeId, setSelectedSourceNodeId] = useState(
    sourceNodes?.[0]?.id || '',
  );
  const { findObjectTargetsConst } = useAutomation();
  const { actions, triggers } = useAutomationNodes();

  useEffect(() => {
    if (!sourceNodes?.length) {
      setSelectedSourceNodeId('');
      return;
    }

    const hasSelectedNode = sourceNodes.some(
      (node) => node.id === selectedSourceNodeId,
    );

    if (!hasSelectedNode) {
      setSelectedSourceNodeId(sourceNodes[0].id);
    }
  }, [selectedSourceNodeId, sourceNodes]);

  const activeSourceNode = sourceNodes?.length
    ? sourceNodes.find((node) => node.id === selectedSourceNodeId) ||
      sourceNodes[0]
    : sourceNode || null;

  const { data, loading } = useQuery<TAutomationNodeOutputResponse>(
    AUTOMATION_NODE_OUTPUT,
    {
      skip: !activeSourceNode?.type,
      variables: {
        nodeType: activeSourceNode?.type || '',
      },
      fetchPolicy: 'cache-first',
    },
  );

  const deferredSearchValue = useDeferredValue(searchValue);
  const searchQuery = deferredSearchValue.trim().toLowerCase();
  const variables = data?.automationNodeOutput?.variables || [];
  const propertySources = data?.automationNodeOutput?.propertySources || [];
  const sourceNodeConfig =
    activeSourceNode?.nodeType === AutomationNodeType.Action
      ? actions.find((action) => action.id === activeSourceNode.id)?.config
      : triggers.find((trigger) => trigger.id === activeSourceNode?.id)?.config;
  const findObjectTarget =
    activeSourceNode?.nodeType === AutomationNodeType.Action &&
    activeSourceNode?.type === 'findObject'
      ? findObjectTargetsConst.find(
          (target) => target.value === sourceNodeConfig?.objectType,
        )
      : null;
  const findObjectVariables =
    findObjectTarget?.output?.variables?.map((variable) => ({
      ...variable,
      key: `object.${variable.key}`,
      label: `${findObjectTarget.label} ${variable.label}`,
    })) || [];
  const findObjectPropertySources =
    findObjectTarget?.output?.propertySources?.map((source) => ({
      ...source,
      key: `object.${source.key}`,
      label: `${findObjectTarget.label} ${source.label}`,
    })) || [];
  const mergedVariables = [...variables, ...findObjectVariables].filter(
    (variable, index, array) =>
      array.findIndex((candidate) => candidate.key === variable.key) === index,
  );
  const mergedPropertySources = [
    ...propertySources,
    ...findObjectPropertySources,
  ].filter(
    (source, index, array) =>
      array.findIndex((candidate) => candidate.key === source.key) === index,
  );
  const scope =
    activeSourceNode?.nodeType === AutomationNodeType.Trigger
      ? 'trigger'
      : activeSourceNode?.nodeType === AutomationNodeType.Action
        ? `actions.${activeSourceNode.id}`
        : '';

  const buildVariablePath = (path: string) =>
    scope ? `${scope}.${path}` : path;
  const buildVariableToken = (path: string) =>
    `{{ ${buildVariablePath(path)} }}`;
  const buildVariablePayload = ({
    key,
    label,
    path,
    token,
  }: {
    key: string;
    label: string;
    path: string;
    token: string;
  }) => ({
    key,
    label,
    path,
    token,
    sourceNodeId: activeSourceNode?.id || '',
    sourceNodeType: activeSourceNode?.type || '',
    sourceNodeLabel: activeSourceNode?.label || '',
  });
  const filteredVariables = !searchQuery
    ? mergedVariables
    : mergedVariables.filter((variable) =>
        `${variable.label} ${variable.key}`.toLowerCase().includes(searchQuery),
      );

  if (!activeSourceNode) {
    if (!emptyState) {
      return null;
    }

    return (
      <div className={cn('space-y-3 px-5 py-4 text-sm', className)}>
        <InfoState {...emptyState} />
      </div>
    );
  }

  return (
    <div className={cn('space-y-3 px-5 py-4 text-sm', className)}>
      {sourceNodes?.length ? (
        <SidebarSection title="Variable Sources">
          <div className="space-y-2">
            {sourceNodes.map((node) => (
              <SourceNodeItem
                key={node.id}
                node={node}
                isSelected={node.id === activeSourceNode.id}
                onClick={() => setSelectedSourceNodeId(node.id)}
              />
            ))}
          </div>
        </SidebarSection>
      ) : (
        <SidebarSection title={sourceSectionTitle}>
          <div className="flex items-center gap-3 rounded-md border bg-background px-3 py-3">
            {activeSourceNode.icon ? (
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <IconComponent
                  className="size-5"
                  name={activeSourceNode.icon}
                />
              </div>
            ) : null}
            <div className="min-w-0">
              <div className="truncate font-medium text-foreground">
                {activeSourceNode.label}
              </div>
            </div>
          </div>
        </SidebarSection>
      )}

      <InfoState
        title="Insert variables"
        description="Click or drag variables into a supported field to insert placeholders."
      />

      <Input
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        placeholder="Search variables..."
        className="h-9"
      />

      <SidebarSection title="Output Variables">
        {loading ? (
          <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-muted-foreground">
            <Spinner size="sm" />
            Loading outputs...
          </div>
        ) : filteredVariables.length > 0 ? (
          <div className="space-y-2">
            {filteredVariables.map((variable) => {
              const path = buildVariablePath(variable.key);
              const token = buildVariableToken(variable.key);
              const payload = buildVariablePayload({
                key: variable.key,
                label: variable.label,
                path,
                token,
              });

              return (
                <VariableCard
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
                    onInsertVariable
                      ? () => onInsertVariable(payload)
                      : undefined
                  }
                  onDragStart={(event) => {
                    setAutomationVariableDragData(event.dataTransfer, payload);
                  }}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            text={
              searchQuery
                ? 'No matching output variables.'
                : 'No output variables available.'
            }
          />
        )}
      </SidebarSection>

      <SidebarSection title="Custom Properties">
        {mergedPropertySources.length > 0 ? (
          <div className="space-y-2">
            {mergedPropertySources.map((source) => (
              <PropertySourceFields
                key={`${source.key}-${source.propertyType}`}
                source={source}
                searchQuery={searchQuery}
                buildVariablePath={buildVariablePath}
                buildVariableToken={buildVariableToken}
                buildVariablePayload={buildVariablePayload}
                onInsertVariable={onInsertVariable}
              />
            ))}
          </div>
        ) : (
          <EmptyState text="No property sources available." />
        )}
      </SidebarSection>
    </div>
  );
};

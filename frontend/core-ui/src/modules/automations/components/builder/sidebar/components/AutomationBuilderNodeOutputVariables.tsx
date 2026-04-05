import {
  TAutomationOutputPropertySource,
  TAutomationOutputVariable,
  useAutomationBuilderSecondarySidebar,
} from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderSecondarySidebar';
import { Badge, IconComponent, Input, Spinner } from 'erxes-ui';
import {
  IField,
  setAutomationVariableDragData,
  useFields,
} from 'ui-modules';

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

const OutputVariableItem = ({
  variable,
  path,
  token,
  onDragStart,
}: {
  variable: TAutomationOutputVariable;
  path: string;
  token: string;
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
}) => {
  return (
    <div
      className="rounded-md border bg-background px-3 py-2 cursor-grab active:cursor-grabbing"
      draggable
      onDragStart={onDragStart}
      title={token}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="font-medium text-foreground">{variable.label}</div>
        {variable.exposure === 'reference' ? (
          <Badge variant="secondary">Reference</Badge>
        ) : null}
      </div>
      <div className="mt-1 break-all font-mono text-xs text-muted-foreground">
        {path}
      </div>
    </div>
  );
};

const PropertyFieldItem = ({
  field,
  path,
  token,
  onDragStart,
}: {
  field: IField;
  path: string;
  token: string;
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
}) => {
  return (
    <div
      className="rounded-md border bg-background px-3 py-2 cursor-grab active:cursor-grabbing"
      draggable
      onDragStart={onDragStart}
      title={token}
    >
      <div className="font-medium text-foreground">{field.name}</div>
      <div className="mt-1 break-all font-mono text-xs text-muted-foreground">
        {path}
      </div>
    </div>
  );
};

const PropertySourceFields = ({
  source,
  searchQuery,
  buildVariablePath,
  buildVariableToken,
  handleDragStart,
}: {
  source: TAutomationOutputPropertySource;
  searchQuery: string;
  buildVariablePath: (path: string) => string;
  buildVariableToken: (path: string) => string;
  handleDragStart: (payload: {
    key: string;
    label: string;
    path: string;
    token: string;
  }) => (event: React.DragEvent<HTMLDivElement>) => void;
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
          {filteredFields.map((field) => {
            const fieldKey = field.code || field.name || field._id;
            const path = buildVariablePath(`${source.key}.${fieldKey}`);
            const token = buildVariableToken(`${source.key}.${fieldKey}`);

            return (
              <PropertyFieldItem
                key={field._id}
                field={field}
                path={path}
                token={token}
                onDragStart={handleDragStart({
                  key: `${source.key}.${fieldKey}`,
                  label: field.name || fieldKey,
                  path,
                  token,
                })}
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

export const AutomationBuilderNodeOutputVariables = () => {
  const {
    selectedNode,
    loading,
    searchValue,
    setSearchValue,
    searchQuery,
    variables,
    propertySources,
    buildVariablePath,
    buildVariableToken,
  } =
    useAutomationBuilderSecondarySidebar();

  const handleDragStart =
    ({
      key,
      label,
      path,
      token,
    }: {
      key: string;
      label: string;
      path: string;
      token: string;
    }) =>
    (event: React.DragEvent<HTMLDivElement>) => {
      if (!selectedNode) {
        return;
      }

      setAutomationVariableDragData(event.dataTransfer, {
        key,
        label,
        path,
        token,
        sourceNodeId: selectedNode.id,
        sourceNodeType: selectedNode.type,
        sourceNodeLabel: selectedNode.label,
      });
    };

  return (
    <div className="space-y-3 px-5 py-4 text-sm">
      <SidebarSection title="Selected Node">
        <div className="flex items-center gap-3 rounded-md border bg-background px-3 py-3">
          {selectedNode?.icon ? (
            <div className="bg-primary/10 text-primary rounded-lg p-2">
              <IconComponent className="size-5" name={selectedNode.icon} />
            </div>
          ) : null}
          <div className="min-w-0">
            <div className="truncate font-medium text-foreground">
              {selectedNode?.label || 'No node selected'}
            </div>
          </div>
        </div>
      </SidebarSection>

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
        ) : variables.length > 0 ? (
          <div className="space-y-2">
            {variables.map((variable) => {
              const path = buildVariablePath(variable.key);
              const token = buildVariableToken(variable.key);

              return (
                <OutputVariableItem
                  key={variable.key}
                  variable={variable}
                  path={path}
                  token={token}
                  onDragStart={handleDragStart({
                    key: variable.key,
                    label: variable.label,
                    path,
                    token,
                  })}
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
        {propertySources.length > 0 ? (
          <div className="space-y-2">
            {propertySources.map((source) => (
              <PropertySourceFields
                key={`${source.key}-${source.propertyType}`}
                source={source}
                searchQuery={searchQuery}
                buildVariablePath={buildVariablePath}
                buildVariableToken={buildVariableToken}
                handleDragStart={handleDragStart}
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

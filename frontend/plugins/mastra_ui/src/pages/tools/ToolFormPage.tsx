import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { IconArrowLeft, IconTool, IconSearch, IconCalculator, IconWorld } from '@tabler/icons-react';
import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  ChoiceboxGroup,
  Label,
  Input,
  ScrollArea,
  Select,
  Separator,
  Skeleton,
  Switch,
  Textarea,
} from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { MASTRA_TOOL, MASTRA_AVAILABLE_ERXES_TOOLS } from '~/graphql/queries';
import { MASTRA_TOOL_CREATE, MASTRA_TOOL_UPDATE } from '~/graphql/mutations';

const BUILTIN_OPTIONS = [
  {
    id: 'webSearch',
    name: 'Web Search',
    description: 'Search Wikipedia for articles related to a query.',
    icon: IconSearch,
  },
  {
    id: 'fetchUrl',
    name: 'Fetch URL / Article Reader',
    description: 'Fetch full text content of a Wikipedia article by title.',
    icon: IconWorld,
  },
  {
    id: 'calculator',
    name: 'Calculator',
    description: 'Evaluate a mathematical expression and return the numeric result.',
    icon: IconCalculator,
  },
];

function toToolId(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="font-medium">{label}</Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

export const ToolFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    toolId: '',
    name: '',
    description: '',
    type: 'builtin' as 'builtin' | 'erxes',
    builtinType: '',
    erxesPlugin: '',
    erxesOperation: '',
    erxesOperationType: 'query' as 'query' | 'mutation',
    graphqlArgs: [] as any[],
    erxesReturnType: null as any,
    erxesResponseFields: '_id',
    isEnabled: true,
  });
  const [autoId, setAutoId] = useState(true);

  const { data: toolData } = useQuery(MASTRA_TOOL, { variables: { _id: id }, skip: !isEdit });
  const { data: erxesToolsData, loading: loadingErxes } = useQuery(MASTRA_AVAILABLE_ERXES_TOOLS, {
    skip: form.type !== 'erxes',
  });

  const [createTool, { loading: creating }] = useMutation(MASTRA_TOOL_CREATE, {
    onCompleted: () => navigate('/settings/mastra/tools'),
  });
  const [updateTool, { loading: updating }] = useMutation(MASTRA_TOOL_UPDATE, {
    onCompleted: () => navigate('/settings/mastra/tools'),
  });

  useEffect(() => {
    if (isEdit && toolData?.mastraTool) {
      const t = toolData.mastraTool;
      setForm({
        toolId: t.toolId || '',
        name: t.name || '',
        description: t.description || '',
        type: t.type || 'builtin',
        builtinType: t.builtinType || '',
        erxesPlugin: t.erxesPlugin || '',
        erxesOperation: t.erxesOperation || '',
        erxesOperationType: t.erxesOperationType || 'query',
        graphqlArgs: t.graphqlArgs || [],
        erxesReturnType: t.erxesReturnType || null,
        erxesResponseFields: t.erxesResponseFields || '_id',
        isEnabled: t.isEnabled ?? true,
      });
      setAutoId(false);
    }
  }, [toolData, isEdit]);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleBuiltinSelect = (builtinType: string) => {
    const opt = BUILTIN_OPTIONS.find((o) => o.id === builtinType);
    set('builtinType', builtinType);
    if (opt) {
      set('name', opt.name);
      set('description', opt.description);
      if (autoId) set('toolId', builtinType);
    }
  };

  const handleErxesOpSelect = (op: any) => {
    set('erxesOperation', op.operation);
    set('erxesOperationType', op.operationType);
    set('erxesPlugin', op.plugin);
    set('graphqlArgs', op.graphqlArgs || []);
    set('erxesReturnType', op.returnType || null);
    set('description', op.description || '');
    if (autoId) set('toolId', toToolId(`${op.plugin}-${op.operation}`));
    if (!form.name) set('name', op.operation);
  };

  const erxesTools = erxesToolsData?.mastraAvailableErxesTools || [];
  const plugins = [...new Set(erxesTools.map((t: any) => t.plugin))].filter(Boolean);
  const opsForPlugin = erxesTools.filter((t: any) => t.plugin === form.erxesPlugin);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      updateTool({ variables: { _id: id, doc: form } });
    } else {
      createTool({ variables: { doc: form } });
    }
  };

  const isSaving = creating || updating;

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/settings/mastra/tools">
                    <IconTool /> Tools
                  </Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <span className="text-muted-foreground">{isEdit ? 'Edit Tool' : 'New Tool'}</span>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
        </PageHeader.Start>
        <PageHeader.End>
          <Button variant="outline" asChild>
            <Link to="/settings/mastra/tools">
              <IconArrowLeft /> Back
            </Link>
          </Button>
          <Button type="submit" form="tool-form" disabled={isSaving}>
            {isSaving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Tool'}
          </Button>
        </PageHeader.End>
      </PageHeader>

      <div className="flex-1 overflow-auto p-4">
        <form id="tool-form" onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">

          {/* Tool type */}
          <Card className="shadow-none">
            <Card.Header className="pb-3">
              <Card.Title className="text-base">Tool Type</Card.Title>
              <Card.Description>Choose what powers this tool.</Card.Description>
            </Card.Header>
            <Card.Content>
              <ChoiceboxGroup
                direction="row"
                value={form.type}
                onValueChange={(v) => set('type', v as 'builtin' | 'erxes')}
              >
                <ChoiceboxGroup.Item value="builtin" title="Category">
                  Built-in
                  <p className="text-xs font-normal text-muted-foreground mt-0.5">
                    Web search, fetch URL, calculator
                  </p>
                </ChoiceboxGroup.Item>
                <ChoiceboxGroup.Item value="erxes" title="Category">
                  erxes Operation
                  <p className="text-xs font-normal text-muted-foreground mt-0.5">
                    Any erxes GraphQL query or mutation
                  </p>
                </ChoiceboxGroup.Item>
              </ChoiceboxGroup>
            </Card.Content>
          </Card>

          {/* Built-in picker */}
          {form.type === 'builtin' && (
            <Card className="shadow-none">
              <Card.Header className="pb-3">
                <Card.Title className="text-base">Select Built-in Tool</Card.Title>
              </Card.Header>
              <Card.Content>
                <ChoiceboxGroup
                  direction="column"
                  value={form.builtinType}
                  onValueChange={handleBuiltinSelect}
                >
                  {BUILTIN_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <ChoiceboxGroup.Item key={opt.id} value={opt.id}>
                        <div className="flex items-start gap-3">
                          <Icon className="size-4 mt-0.5 shrink-0" />
                          <div>
                            <div className="font-medium text-sm">{opt.name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{opt.description}</div>
                          </div>
                        </div>
                      </ChoiceboxGroup.Item>
                    );
                  })}
                </ChoiceboxGroup>
              </Card.Content>
            </Card>
          )}

          {/* erxes operation picker */}
          {form.type === 'erxes' && (
            <Card className="shadow-none">
              <Card.Header className="pb-3">
                <Card.Title className="text-base">Select erxes Operation</Card.Title>
                <Card.Description>Operations are discovered from the gateway at runtime.</Card.Description>
              </Card.Header>
              <Card.Content className="space-y-4">
                <Field label="Plugin *">
                  {loadingErxes ? (
                    <Skeleton className="h-9 w-full" />
                  ) : (
                    <Select
                      value={form.erxesPlugin}
                      onValueChange={(v) => { set('erxesPlugin', v); set('erxesOperation', ''); }}
                      required
                    >
                      <Select.Trigger className="w-full border border-border rounded-md px-3 py-2 h-9">
                        <Select.Value placeholder="Select plugin…" />
                      </Select.Trigger>
                      <Select.Content>
                        {plugins.map((p: any) => (
                          <Select.Item key={p} value={p}>{p}</Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  )}
                </Field>

                {form.erxesPlugin && (
                  <Field label="Operation *">
                    <ScrollArea className="h-64 rounded-md border">
                      <div className="p-2 space-y-0.5">
                        {opsForPlugin.map((op: any) => {
                          const isSelected = form.erxesOperation === op.operation;
                          return (
                            <button
                              key={`${op.operationType}-${op.operation}`}
                              type="button"
                              onClick={() => handleErxesOpSelect(op)}
                              className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${
                                isSelected
                                  ? 'bg-primary/10 border border-primary'
                                  : 'hover:bg-accent border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-medium">{op.operation}</span>
                                <Badge
                                  variant={op.operationType === 'mutation' ? 'warning' : 'info'}
                                  className="text-xs"
                                >
                                  {op.operationType}
                                </Badge>
                              </div>
                              {op.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">{op.description}</p>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </Field>
                )}

                {form.erxesOperation && (
                  <Field
                    label="Response Fields"
                    hint="Space-separated GraphQL fields to return. Used only when the operation returns an object type."
                  >
                    <Input
                      value={form.erxesResponseFields}
                      onChange={(e) => set('erxesResponseFields', e.target.value)}
                      placeholder="_id firstName lastName primaryEmail"
                      className="font-mono text-sm"
                    />
                  </Field>
                )}
              </Card.Content>
            </Card>
          )}

          {/* Identity */}
          <Card className="shadow-none">
            <Card.Header className="pb-3">
              <Card.Title className="text-base">Identity</Card.Title>
              <Card.Description>The LLM uses the name and description to decide when to call this tool.</Card.Description>
            </Card.Header>
            <Card.Content className="space-y-4">
              <Field label="Tool ID *" hint="Unique machine identifier. Auto-generated from name.">
                <Input
                  value={form.toolId}
                  onChange={(e) => { setAutoId(false); set('toolId', e.target.value); }}
                  placeholder="web-search"
                  className="font-mono text-sm"
                  required
                />
              </Field>

              <Field label="Name *">
                <Input
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Tool display name"
                  required
                />
              </Field>

              <Field label="Description">
                <Textarea
                  value={form.description}
                  onChange={(e: any) => set('description', e.target.value)}
                  placeholder="What this tool does — the LLM uses this to decide when to call it"
                  rows={3}
                />
              </Field>
            </Card.Content>
          </Card>

          {/* Settings */}
          <Card className="shadow-none">
            <Card.Content className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label className="font-medium">Enabled</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Disabled tools won't be available to any agent
                  </p>
                </div>
                <Switch
                  checked={form.isEnabled}
                  onCheckedChange={(v) => set('isEnabled', v)}
                />
              </div>
            </Card.Content>
          </Card>

          {/* Mobile submit */}
          <div className="flex gap-3 pb-4 sm:hidden">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Tool'}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/settings/mastra/tools">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

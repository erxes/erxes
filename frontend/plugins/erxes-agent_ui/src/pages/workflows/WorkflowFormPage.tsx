import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import {
  IconArrowLeft,
  IconCircleCheck,
  IconInfoCircle,
  IconSitemap,
} from '@tabler/icons-react';
import {
  Alert,
  Breadcrumb,
  Button,
  Input,
  Label,
  Separator,
  Switch,
  Textarea,
  toast,
} from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { MASTRA_WORKFLOW, MASTRA_WORKFLOWS } from '~/graphql/queries';
import {
  MASTRA_WORKFLOW_CREATE,
  MASTRA_WORKFLOW_UPDATE,
  MASTRA_WORKFLOW_VALIDATE,
} from '~/graphql/mutations';
import { Field, FormSection } from '~/components/FormLayout';
import { WorkflowGraph } from './graph/WorkflowGraph';

// Minimal valid starter so a hand-authored workflow begins from a runnable shape.
const TEMPLATE = {
  trigger: { type: 'manual', config: {} },
  policy: { mode: 'custom', allowed: [] },
  bindings: {},
  limits: { maxLlmCalls: 10 },
  steps: [
    { id: 'done', type: 'end', output: { message: 'Hello from workflow' } },
  ],
};

type ValidationResult = {
  ok: boolean;
  errors?: { path?: string; message: string }[];
} | null;

export const WorkflowFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [definitionText, setDefinitionText] = useState(
    JSON.stringify(TEMPLATE, null, 2),
  );
  const [validation, setValidation] = useState<ValidationResult>(null);

  const { data: workflowData } = useQuery(MASTRA_WORKFLOW, {
    variables: { _id: id },
    skip: !isEdit,
  });

  useEffect(() => {
    const w = workflowData?.mastraWorkflow;
    if (isEdit && w) {
      setName(w.name || '');
      setDescription(w.description || '');
      setIsEnabled(w.isEnabled ?? false);
      setDefinitionText(JSON.stringify(w.definition ?? {}, null, 2));
    }
  }, [workflowData, isEdit]);

  // Any edit invalidates the last validation verdict.
  const handleDefinitionChange = (text: string) => {
    setDefinitionText(text);
    setValidation(null);
  };

  // Live graph preview — renders whenever the JSON parses (independent of the
  // server-side Validate verdict).
  const previewDefinition = useMemo(() => {
    try {
      return JSON.parse(definitionText);
    } catch {
      return null;
    }
  }, [definitionText]);

  const parseDefinition = (): any | null => {
    try {
      return JSON.parse(definitionText);
    } catch (e: any) {
      setValidation({
        ok: false,
        errors: [{ path: '(json)', message: e.message }],
      });
      return null;
    }
  };

  const [validateDefinition, { loading: validating }] = useMutation(
    MASTRA_WORKFLOW_VALIDATE,
    {
      onCompleted: (data) =>
        setValidation(data?.mastraWorkflowValidate ?? null),
      onError: (e) =>
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        }),
    },
  );

  const handleValidate = () => {
    const definition = parseDefinition();
    if (definition) validateDefinition({ variables: { definition } });
  };

  const mutationOptions = {
    refetchQueries: [{ query: MASTRA_WORKFLOWS }],
    awaitRefetchQueries: true,
    onError: (e: any) =>
      toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  };

  const [createWorkflow, { loading: creating }] = useMutation(
    MASTRA_WORKFLOW_CREATE,
    {
      ...mutationOptions,
      onCompleted: (data) => {
        const _id = data?.mastraWorkflowCreate?._id;
        navigate(
          _id ? `/erxes-agent/workflows/${_id}` : '/erxes-agent/workflows',
        );
      },
    },
  );
  const [updateWorkflow, { loading: updating }] = useMutation(
    MASTRA_WORKFLOW_UPDATE,
    {
      ...mutationOptions,
      onCompleted: () => navigate(`/erxes-agent/workflows/${id}`),
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const definition = parseDefinition();
    if (!definition) return;

    const doc = { name, description, definition, isEnabled };
    if (isEdit) updateWorkflow({ variables: { _id: id, doc } });
    else createWorkflow({ variables: { doc } });
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
                  <Link to="/erxes-agent/workflows">
                    <IconSitemap />
                    Workflows
                  </Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <span className="text-muted-foreground">
                  {isEdit ? 'Edit Workflow' : 'New Workflow'}
                </span>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
        </PageHeader.Start>
        <PageHeader.End>
          <Button variant="outline" asChild>
            <Link to="/erxes-agent/workflows">
              <IconArrowLeft /> Back
            </Link>
          </Button>
          <Button
            type="submit"
            form="workflow-form"
            disabled={isSaving || !name}
          >
            {isSaving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Workflow'}
          </Button>
        </PageHeader.End>
      </PageHeader>

      <div className="flex-1 overflow-auto p-4">
        <form
          id="workflow-form"
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto space-y-4"
        >
          <FormSection title="Basic Info">
            <Field label="Name *">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Daily lead follow-up"
                required
              />
            </Field>

            <Field label="Description">
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What this workflow does"
              />
            </Field>

            <div className="flex items-center justify-between gap-4">
              <div>
                <Label className="font-medium">Enabled</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Disabled workflows ignore schedule/automation triggers. Manual
                  runs always work.
                </p>
              </div>
              <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
            </div>
          </FormSection>

          <FormSection
            title="Definition"
            description="The workflow DSL as JSON. Most workflows are authored by agents in Chat — edit here only when you need manual control."
          >
            <Alert>
              <IconInfoCircle className="size-4" />
              <Alert.Title>Format</Alert.Title>
              <Alert.Description>
                Steps: <code className="font-mono">operation</code>,{' '}
                <code className="font-mono">agent</code>,{' '}
                <code className="font-mono">branch</code>,{' '}
                <code className="font-mono">parallel</code>,{' '}
                <code className="font-mono">end</code>. Reference earlier data
                with{' '}
                <code className="font-mono">{'{{trigger.payload.x}}'}</code> and{' '}
                <code className="font-mono">{'{{steps.<id>.output.x}}'}</code>.
                Validate before saving — invalid definitions are rejected.
              </Alert.Description>
            </Alert>

            <Textarea
              value={definitionText}
              onChange={(e: any) => handleDefinitionChange(e.target.value)}
              rows={20}
              className="font-mono text-xs"
              spellCheck={false}
            />

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleValidate}
                disabled={validating}
              >
                {validating ? 'Validating…' : 'Validate'}
              </Button>
              {validation?.ok && (
                <span className="flex items-center gap-1.5 text-sm text-success">
                  <IconCircleCheck className="size-4" /> Definition is valid
                </span>
              )}
            </div>

            {previewDefinition && (
              <div className="space-y-1.5">
                <Label className="font-medium">Preview</Label>
                <WorkflowGraph
                  definition={previewDefinition}
                  className="h-80 rounded-md border border-border/60 bg-muted/20"
                />
              </div>
            )}

            {validation && !validation.ok && (
              <Alert variant="destructive">
                <Alert.Title>
                  {validation.errors?.length || 0} validation error
                  {(validation.errors?.length || 0) !== 1 ? 's' : ''}
                </Alert.Title>
                <Alert.Description>
                  <ul className="space-y-1 mt-1">
                    {(validation.errors || []).map((err, i) => (
                      <li key={i} className="text-sm">
                        {err.path && (
                          <code className="font-mono text-xs mr-1.5">
                            {err.path}
                          </code>
                        )}
                        {err.message}
                      </li>
                    ))}
                  </ul>
                </Alert.Description>
              </Alert>
            )}
          </FormSection>
        </form>
      </div>
    </div>
  );
};

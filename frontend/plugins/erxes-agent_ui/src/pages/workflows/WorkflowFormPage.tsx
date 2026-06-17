import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
  Form,
  Input,
  Label,
  Separator,
  Switch,
  Textarea,
  toast,
} from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { FormSection } from '~/components/FormLayout';
import { WorkflowGraph } from './graph/WorkflowGraph';
import { useWorkflow } from './hooks/useWorkflow';
import { useWorkflowFormMutations } from './hooks/useWorkflowMutations';
import { IWorkflowDefinition, IWorkflowValidation } from './types';
import { workflowFormSchema, WorkflowFormValues } from './validations';

// Minimal valid starter so a hand-authored workflow begins from a runnable shape.
const TEMPLATE: IWorkflowDefinition = {
  trigger: { type: 'manual', config: {} },
  policy: { mode: 'custom', allowed: [] },
  bindings: {},
  limits: { maxLlmCalls: 10 },
  steps: [
    { id: 'done', type: 'end', output: { message: 'Hello from workflow' } },
  ],
};

const DEFAULT_VALUES: WorkflowFormValues = {
  name: '',
  description: '',
  isEnabled: false,
  definitionText: JSON.stringify(TEMPLATE, null, 2),
};

/** Safe parse of the controlled JSON text field; null when it does not parse. */
const parseDefinition = (text: string): IWorkflowDefinition | null => {
  try {
    return JSON.parse(text) as IWorkflowDefinition;
  } catch {
    return null;
  }
};

export const WorkflowFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [validation, setValidation] = useState<IWorkflowValidation | null>(
    null,
  );

  const form = useForm<WorkflowFormValues>({
    resolver: zodResolver(workflowFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { workflow } = useWorkflow(id, !isEdit);

  useEffect(() => {
    if (isEdit && workflow) {
      form.reset({
        name: workflow.name || '',
        description: workflow.description || '',
        isEnabled: workflow.isEnabled ?? false,
        definitionText: JSON.stringify(workflow.definition ?? {}, null, 2),
      });
    }
  }, [workflow, isEdit, form]);

  const {
    validate,
    validating,
    createWorkflow,
    creating,
    updateWorkflow,
    updating,
  } = useWorkflowFormMutations({
    onValidated: setValidation,
    onCreated: (newId) =>
      navigate(
        newId ? `/erxes-agent/workflows/${newId}` : '/erxes-agent/workflows',
      ),
    onUpdated: () => navigate(`/erxes-agent/workflows/${id}`),
  });

  const definitionText = form.watch('definitionText');

  // Live graph preview — renders whenever the JSON parses (independent of the
  // server-side Validate verdict).
  const previewDefinition = useMemo(
    () => parseDefinition(definitionText),
    [definitionText],
  );

  const handleValidate = () => {
    const definition = parseDefinition(definitionText);
    if (!definition) {
      setValidation({
        ok: false,
        errors: [{ path: '(json)', message: 'Definition must be valid JSON' }],
      });
      return;
    }
    validate(definition);
  };

  const onSubmit = (values: WorkflowFormValues) => {
    const definition = parseDefinition(values.definitionText);
    if (!definition) {
      toast({
        title: 'Invalid definition',
        description: 'Definition must be valid JSON',
        variant: 'destructive',
      });
      return;
    }

    const doc = {
      name: values.name,
      description: values.description,
      definition,
      isEnabled: values.isEnabled,
    };
    if (isEdit) updateWorkflow({ variables: { _id: id, doc } });
    else createWorkflow({ variables: { doc } });
  };

  const isSaving = creating || updating;
  const name = form.watch('name');

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
        <Form {...form}>
          <form
            id="workflow-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="max-w-2xl mx-auto space-y-4"
          >
            <FormSection title="Basic Info">
              <Form.Field
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Name</Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder="Daily lead follow-up" />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="description"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Description</Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder="What this workflow does" />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="isEnabled"
                render={({ field }) => (
                  <Form.Item className="flex items-center justify-between gap-4 space-y-0">
                    <div>
                      <Form.Label>Enabled</Form.Label>
                      <Form.Description className="mt-0.5">
                        Disabled workflows ignore schedule/automation triggers.
                        Manual runs always work.
                      </Form.Description>
                    </div>
                    <Form.Control>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>
                  </Form.Item>
                )}
              />
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
                  <code className="font-mono">{'{{trigger.payload.x}}'}</code>{' '}
                  and{' '}
                  <code className="font-mono">{'{{steps.<id>.output.x}}'}</code>
                  . Validate before saving — invalid definitions are rejected.
                </Alert.Description>
              </Alert>

              <Form.Field
                control={form.control}
                name="definitionText"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Control>
                      <Textarea
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          setValidation(null);
                        }}
                        onBlur={field.onBlur}
                        rows={20}
                        className="font-mono text-xs"
                        spellCheck={false}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
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
        </Form>
      </div>
    </div>
  );
};

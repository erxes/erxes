import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import {
  IconArrowLeft,
  IconCalendarTime,
  IconInfoCircle,
} from '@tabler/icons-react';
import {
  Alert,
  Button,
  Breadcrumb,
  Combobox,
  Command,
  Input,
  Label,
  Popover,
  Separator,
  Switch,
  Textarea,
  toast,
} from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import {
  MASTRA_AGENTS,
  MASTRA_SCHEDULE,
  MASTRA_SCHEDULES,
} from '~/graphql/queries';
import {
  MASTRA_SCHEDULE_CREATE,
  MASTRA_SCHEDULE_UPDATE,
} from '~/graphql/mutations';
import { Field, FormSection } from '~/components/FormLayout';
import { ScheduleTimingFields } from './ScheduleTimingFields';

interface IAgentOption {
  agentId: string;
  name: string;
  isEnabled: boolean;
}

/** Combobox over the enabled agents; the schedule runs against the pick. */
const SelectAgent = ({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (agentId: string) => void;
}) => {
  const { data, loading } = useQuery(MASTRA_AGENTS);
  const [open, setOpen] = useState(false);
  const agents: IAgentOption[] = (data?.mastraAgents || []).filter(
    (a: IAgentOption) => a.isEnabled,
  );
  const selected = agents.find((a) => a.agentId === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger className="h-9">
        <Combobox.Value
          value={selected ? selected.name : value || ''}
          placeholder="Select agent…"
          loading={loading && !agents.length && Boolean(value)}
        />
      </Combobox.Trigger>
      <Combobox.Content>
        <Command>
          <Command.Input placeholder="Search agents…" />
          <Command.List>
            <Combobox.Empty loading={loading} />
            {agents.map((a) => (
              <Command.Item
                key={a.agentId}
                value={`${a.name} ${a.agentId}`}
                onSelect={() => {
                  onValueChange(a.agentId);
                  setOpen(false);
                }}
              >
                {a.name}
                <span className="ml-2 text-xs text-muted-foreground font-mono">
                  {a.agentId}
                </span>
                <Combobox.Check checked={a.agentId === value} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

/** Create/edit form for one scheduled agent run. */
export const ScheduleFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '',
    description: '',
    agentId: '',
    cron: '0 9 * * *',
    timezone: 'UTC',
    prompt: '',
    isEnabled: false,
  });

  const { data: scheduleData } = useQuery(MASTRA_SCHEDULE, {
    variables: { _id: id },
    skip: !isEdit,
  });

  useEffect(() => {
    if (isEdit && scheduleData?.mastraSchedule) {
      const schedule = scheduleData.mastraSchedule;
      setForm({
        name: schedule.name || '',
        description: schedule.description || '',
        agentId: schedule.agentId || '',
        cron: schedule.cron || '0 9 * * *',
        timezone: schedule.timezone || 'UTC',
        prompt: schedule.prompt || '',
        isEnabled: schedule.isEnabled ?? false,
      });
    }
  }, [scheduleData, isEdit]);

  const mutationOptions = {
    refetchQueries: [{ query: MASTRA_SCHEDULES }],
    awaitRefetchQueries: true,
    onCompleted: () => navigate('/erxes-agent/schedules'),
    onError: (e: { message: string }) =>
      toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  };
  const [createSchedule, { loading: creating }] = useMutation(
    MASTRA_SCHEDULE_CREATE,
    mutationOptions,
  );
  const [updateSchedule, { loading: updating }] = useMutation(
    MASTRA_SCHEDULE_UPDATE,
    mutationOptions,
  );

  /** Patch one form field by key. */
  const set = (k: string, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  /** Save the schedule; the missing-agent case also disables both buttons. */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agentId) {
      toast({
        title: 'Agent required',
        description: 'Pick the agent this schedule should run.',
        variant: 'destructive',
      });
      return;
    }
    if (isEdit) {
      updateSchedule({ variables: { _id: id, doc: form } });
    } else {
      createSchedule({ variables: { doc: form } });
    }
  };

  const isSaving = creating || updating;
  const saveLabel = isEdit ? 'Save Changes' : 'Create Schedule';

  return (
    // skipcq: JS-0415 — page scaffolding (header/breadcrumb) nests past the cap
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/erxes-agent/schedules">
                    <IconCalendarTime />
                    Schedules
                  </Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <span className="text-muted-foreground">
                  {isEdit ? 'Edit Schedule' : 'New Schedule'}
                </span>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
        </PageHeader.Start>
        <PageHeader.End>
          <Button variant="outline" asChild>
            <Link to="/erxes-agent/schedules">
              <IconArrowLeft /> Back
            </Link>
          </Button>
          <Button
            type="submit"
            form="schedule-form"
            disabled={isSaving || !form.agentId}
          >
            {isSaving ? 'Saving…' : saveLabel}
          </Button>
        </PageHeader.End>
      </PageHeader>

      <div className="flex-1 overflow-auto p-4">
        <form
          id="schedule-form"
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto space-y-4"
        >
          <FormSection title="Basic Info">
            <Field label="Name *">
              <Input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Daily sales summary"
                required
              />
            </Field>

            <Field label="Description">
              <Input
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="What this schedule does"
              />
            </Field>

            <Field label="Agent *" hint="The agent this schedule runs.">
              <SelectAgent
                value={form.agentId}
                onValueChange={(v) => set('agentId', v)}
              />
            </Field>

            <Field
              label="Prompt *"
              hint="Sent to the agent as the user message on every run."
            >
              <Textarea
                value={form.prompt}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  set('prompt', e.target.value)
                }
                placeholder="Summarize yesterday's new deals and flag anything unusual…"
                rows={5}
                required
              />
            </Field>
          </FormSection>

          <FormSection title="Timing" description="How often the agent runs.">
            <ScheduleTimingFields
              key={id ?? 'new'}
              cron={form.cron}
              timezone={form.timezone}
              onCronChange={(v) => set('cron', v)}
              onTimezoneChange={(v) => set('timezone', v)}
            />
          </FormSection>

          <FormSection title="Activation">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label className="font-medium">Enabled</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Disabled schedules never fire on the cron — you can still test
                  them with “Run now”.
                </p>
              </div>
              <Switch
                checked={form.isEnabled}
                onCheckedChange={(v: boolean) => set('isEnabled', v)}
              />
            </div>

            <Alert>
              <IconInfoCircle className="size-4" />
              <Alert.Title>Background runs</Alert.Title>
              <Alert.Description>
                Scheduled runs execute with the app token configured in General
                Settings, not your user session. Output lands in a dedicated
                chat thread named after the schedule.
              </Alert.Description>
            </Alert>
          </FormSection>

          <div className="flex gap-3 pb-4 sm:hidden">
            <Button type="submit" disabled={isSaving || !form.agentId}>
              {isSaving ? 'Saving…' : saveLabel}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/erxes-agent/schedules">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

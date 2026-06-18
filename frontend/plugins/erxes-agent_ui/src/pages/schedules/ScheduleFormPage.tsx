import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  Form,
  Input,
  Popover,
  Separator,
  Switch,
  Textarea,
  toast,
} from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { MASTRA_SCHEDULE, MASTRA_SCHEDULES } from '~/graphql/queries';
import {
  MASTRA_SCHEDULE_CREATE,
  MASTRA_SCHEDULE_UPDATE,
} from '~/graphql/mutations';
import { FormSection } from '~/components/FormLayout';
import { ScheduleTimingFields } from './ScheduleTimingFields';
import { useScheduleAgents } from './hooks/useScheduleAgents';
import { IScheduleQueryResponse } from './types';

const scheduleFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  agentId: z.string().min(1, 'Pick the agent this schedule should run'),
  cron: z
    .string()
    .min(1, 'Cron expression is required')
    .refine((value) => {
      const fields = value.trim().split(/\s+/).length;
      return fields >= 5 && fields <= 6;
    }, 'Cron expression must have 5 or 6 fields'),
  timezone: z.string(),
  prompt: z.string().min(1, 'Prompt is required'),
  isEnabled: z.boolean(),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

const DEFAULT_VALUES: ScheduleFormValues = {
  name: '',
  description: '',
  agentId: '',
  cron: '0 9 * * *',
  timezone: 'UTC',
  prompt: '',
  isEnabled: false,
};

/** Combobox over the enabled agents; the schedule runs against the pick. */
const SelectAgent = ({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (agentId: string) => void;
}) => {
  const { agents, loading } = useScheduleAgents();
  const [open, setOpen] = useState(false);
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

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { data: scheduleData } = useQuery<IScheduleQueryResponse>(
    MASTRA_SCHEDULE,
    {
      variables: { _id: id },
      skip: !isEdit,
    },
  );

  useEffect(() => {
    if (isEdit && scheduleData?.mastraSchedule) {
      const schedule = scheduleData.mastraSchedule;
      form.reset({
        name: schedule.name || '',
        description: schedule.description || '',
        agentId: schedule.agentId || '',
        cron: schedule.cron || DEFAULT_VALUES.cron,
        timezone: schedule.timezone || 'UTC',
        prompt: schedule.prompt || '',
        isEnabled: schedule.isEnabled ?? false,
      });
    }
  }, [scheduleData, isEdit, form]);

  const mutationOptions = (successTitle: string) => ({
    refetchQueries: [{ query: MASTRA_SCHEDULES }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      toast({ title: successTitle });
      navigate('/erxes-agent/schedules');
    },
    onError: (e: { message: string }) =>
      toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
  const [createSchedule, { loading: creating }] = useMutation(
    MASTRA_SCHEDULE_CREATE,
    mutationOptions('Schedule created'),
  );
  const [updateSchedule, { loading: updating }] = useMutation(
    MASTRA_SCHEDULE_UPDATE,
    mutationOptions('Schedule updated'),
  );

  /** Save the schedule; zod has already validated by the time this runs. */
  const onSubmit = (doc: ScheduleFormValues) => {
    if (isEdit) {
      updateSchedule({ variables: { _id: id, doc } });
    } else {
      createSchedule({ variables: { doc } });
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
          <Button type="submit" form="schedule-form" disabled={isSaving}>
            {isSaving ? 'Saving…' : saveLabel}
          </Button>
        </PageHeader.End>
      </PageHeader>

      <div className="flex-1 overflow-auto p-4">
        <Form {...form}>
          <form
            id="schedule-form"
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
                      <Input {...field} placeholder="Daily sales summary" />
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
                      <Input {...field} placeholder="What this schedule does" />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="agentId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Agent</Form.Label>
                    <SelectAgent
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                    <Form.Description>
                      The agent this schedule runs.
                    </Form.Description>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Prompt</Form.Label>
                    <Form.Control>
                      <Textarea
                        {...field}
                        placeholder="Summarize yesterday's new deals and flag anything unusual…"
                        rows={5}
                      />
                    </Form.Control>
                    <Form.Description>
                      Sent to the agent as the user message on every run.
                    </Form.Description>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </FormSection>

            <FormSection title="Timing" description="How often the agent runs.">
              <Form.Field
                control={form.control}
                name="cron"
                render={({ field }) => (
                  <Form.Item>
                    <ScheduleTimingFields
                      key={id ?? 'new'}
                      cron={field.value}
                      timezone={form.watch('timezone')}
                      onCronChange={field.onChange}
                      onTimezoneChange={(tz) =>
                        form.setValue('timezone', tz, { shouldDirty: true })
                      }
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </FormSection>

            <FormSection title="Activation">
              <Form.Field
                control={form.control}
                name="isEnabled"
                render={({ field }) => (
                  <Form.Item className="flex items-center justify-between gap-4 space-y-0">
                    <div>
                      <Form.Label>Enabled</Form.Label>
                      <Form.Description className="mt-0.5">
                        Disabled schedules never fire on the cron — you can
                        still test them with “Run now”.
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

              <Alert>
                <IconInfoCircle className="size-4" />
                <Alert.Title>Background runs</Alert.Title>
                <Alert.Description>
                  Scheduled runs execute with the app token configured in
                  General Settings, not your user session. Output lands in a
                  dedicated chat thread named after the schedule.
                </Alert.Description>
              </Alert>
            </FormSection>

            <div className="flex gap-3 pb-4 sm:hidden">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving…' : saveLabel}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/erxes-agent/schedules">Cancel</Link>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

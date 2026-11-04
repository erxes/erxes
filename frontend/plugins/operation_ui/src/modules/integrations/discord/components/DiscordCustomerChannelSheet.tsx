import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, UseFormReturn } from 'react-hook-form';
import {
  Alert,
  Badge,
  Button,
  Form,
  MultipleSelector,
  Select,
  Sheet,
  Spinner,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { CompaniesInline, SelectCompany } from 'ui-modules';
import { IntegrationSteps } from '@/integrations/components/IntegrationSteps';
import { SelectTeam } from '@/team/components/SelectTeam';
import { TeamInline } from '@/team/components/TeamInline';
import { useDiscordChannels } from '../hooks/useDiscordIntegration';
import {
  useLinkDiscordCustomerChannels,
  useSaveDiscordCustomerChannel,
} from '../hooks/useDiscordCommands';
import {
  DISCORD_CUSTOMER_CHANNEL_SCHEMA,
  TDiscordCustomerChannelForm,
} from '../schemas';
import {
  IDiscordConfigSummary,
  IDiscordConnection,
  IDiscordCustomerChannel,
} from '../types';

const CHANNEL_STEPS = [
  {
    title: 'Pick channels',
    description:
      'Choose the company channels where people report issues and follow their tasks.',
  },
  {
    title: 'Company and team',
    description:
      'Choose the company these channels belong to and the team that handles their reports.',
  },
] as const;

const firstValue = (value: string | string[]) =>
  Array.isArray(value) ? value[0] ?? '' : value;

export type TDiscordCustomerChannelDefaults = {
  companyId?: string;
  teamId?: string;
};

function ChannelsStep({
  form,
  connections,
  channelOptions,
  loading,
  error,
  current,
}: Readonly<{
  form: UseFormReturn<TDiscordCustomerChannelForm>;
  connections: IDiscordConnection[];
  channelOptions: { value: string; label: string }[];
  loading: boolean;
  error?: string;
  current: IDiscordCustomerChannel | null;
}>) {
  const labelById = useMemo(
    () => new Map(channelOptions.map((option) => [option.value, option.label])),
    [channelOptions],
  );
  const connectionId = form.watch('connectionId');

  return (
    <div className="flex flex-col gap-4">
      <Form.Field
        control={form.control}
        name="connectionId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Server</Form.Label>
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                form.setValue('channelIds', []);
              }}
            >
              <Form.Control>
                <Select.Trigger>
                  <Select.Value placeholder="Select a server" />
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                {connections.map((connection) => (
                  <Select.Item key={connection._id} value={connection._id}>
                    {connection.guildName}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Form.Message />
          </Form.Item>
        )}
      />

      {error ? (
        <Alert variant="destructive">
          <Alert.Description>{error}</Alert.Description>
        </Alert>
      ) : null}

      <Form.Field
        control={form.control}
        name="channelIds"
        render={({ field }) => {
          const allSelected =
            channelOptions.length > 0 &&
            field.value.length === channelOptions.length;

          return (
            <Form.Item>
              <div className="flex items-center justify-between">
                <Form.Label>Discord channels</Form.Label>
                {channelOptions.length ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto px-1 text-xs text-primary"
                    onClick={() =>
                      field.onChange(
                        allSelected
                          ? []
                          : channelOptions.map((option) => option.value),
                      )
                    }
                  >
                    {allSelected ? 'Clear all' : 'Select all'}
                  </Button>
                ) : null}
              </div>
              <MultipleSelector
                value={channelOptions.filter((option) =>
                  field.value.includes(option.value),
                )}
                onChange={(options) =>
                  field.onChange(options.map((option) => option.value))
                }
                options={channelOptions}
                disabled={loading || !connectionId}
                hidePlaceholderWhenSelected
                commandProps={{
                  filter: (value, search) =>
                    (labelById.get(value) ?? '')
                      .toLowerCase()
                      .includes(search.trim().toLowerCase())
                      ? 1
                      : 0,
                }}
                placeholder={
                  loading ? 'Loading channels…' : 'Select one or more channels'
                }
                emptyIndicator={
                  <p className="py-2 text-center text-sm text-muted-foreground">
                    No channels left to link
                  </p>
                }
              />
              <Form.Description>
                {current
                  ? `Selected channels share this company and team. Removing #${current.channelName} unlinks it.`
                  : 'Channels that post a team’s updates or belong to another company are hidden.'}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          );
        }}
      />
    </div>
  );
}

function CustomerChannelPreview({
  channelLabels,
  companyId,
  teamId,
}: Readonly<{
  channelLabels: string[];
  companyId: string;
  teamId: string;
}>) {
  return (
    <section
      aria-label="Summary"
      className="rounded-lg border border-border bg-accent/40 text-sm"
    >
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2 p-3">
        <dt className="self-start leading-6 text-muted-foreground">Channels</dt>
        <dd className="flex flex-wrap gap-1">
          {channelLabels.map((label) => (
            <Badge key={label} variant="secondary">
              {label}
            </Badge>
          ))}
        </dd>
        <dt className="text-muted-foreground">Company</dt>
        <dd className="flex min-w-0">
          <CompaniesInline companyIds={[companyId]} />
        </dd>
        <dt className="text-muted-foreground">Team</dt>
        <dd className="flex min-w-0">
          <TeamInline teamId={teamId} />
        </dd>
      </dl>

      <div className="border-t border-border p-3">
        <p className="mb-2 font-medium">People in these channels can</p>
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2">
          <dt>
            <code className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-xs">
              /triage new
            </code>
          </dt>
          <dd className="text-muted-foreground">
            Report an issue. It arrives as a new triage in the team above.
          </dd>
          <dt>
            <code className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-xs">
              /tasks
            </code>
          </dt>
          <dd className="text-muted-foreground">
            See the company’s open triages and tasks.
          </dd>
          <dt className="text-xs font-medium">Replies</dt>
          <dd className="text-muted-foreground">
            The bot answers in the channel a report came from when it is
            accepted, assigned, completed or declined.
          </dd>
        </dl>
      </div>
    </section>
  );
}

function CompanyTeamStep({
  form,
  selectedChannelLabels,
}: Readonly<{
  form: UseFormReturn<TDiscordCustomerChannelForm>;
  selectedChannelLabels: string[];
}>) {
  const companyId = form.watch('companyId');
  const teamId = form.watch('teamId');

  return (
    <div className="flex flex-col gap-4">
      <Form.Field
        control={form.control}
        name="companyId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Company</Form.Label>
            <SelectCompany
              mode="single"
              value={field.value}
              onValueChange={(value) => field.onChange(firstValue(value))}
            />
            <Form.Description>
              The company these channels belong to.
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="teamId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Team</Form.Label>
            <SelectTeam.FormItem
              mode="single"
              value={field.value}
              onValueChange={(value) => field.onChange(firstValue(value))}
            />
            <Form.Description>
              Issues reported in these channels arrive as triages in this team.
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />

      {selectedChannelLabels.length > 0 && companyId && teamId ? (
        <CustomerChannelPreview
          channelLabels={selectedChannelLabels}
          companyId={companyId}
          teamId={teamId}
        />
      ) : null}
    </div>
  );
}

export function DiscordCustomerChannelSheet({
  open,
  onOpenChange,
  connections,
  configs,
  customerChannels,
  current,
  defaults,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connections: IDiscordConnection[];
  configs: IDiscordConfigSummary[];
  customerChannels: IDiscordCustomerChannel[];
  current: IDiscordCustomerChannel | null;
  defaults: TDiscordCustomerChannelDefaults;
}>) {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [step, setStep] = useState(1);
  const defaultValues = useMemo<TDiscordCustomerChannelForm>(
    () => ({
      connectionId: current?.connectionId ?? connections[0]?._id ?? '',
      channelIds: current ? [current.channelId] : [],
      companyId: current?.companyId ?? defaults.companyId ?? '',
      teamId: current?.teamId ?? defaults.teamId ?? '',
    }),
    [connections, current, defaults],
  );

  const form = useForm<TDiscordCustomerChannelForm>({
    resolver: zodResolver(DISCORD_CUSTOMER_CHANNEL_SCHEMA),
    defaultValues,
  });
  const connectionId = form.watch('connectionId');
  const channelIds = form.watch('channelIds');
  const {
    channels,
    loading: channelsLoading,
    error: channelsError,
  } = useDiscordChannels(connectionId, !open);

  const channelOptions = useMemo(() => {
    const unavailable = new Set([
      ...configs.map((config) => config.channelId),
      ...customerChannels
        .filter((channel) => channel._id !== current?._id)
        .map((channel) => channel.channelId),
    ]);

    return channels
      .filter((channel) => !unavailable.has(channel.id))
      .map((channel) => ({ value: channel.id, label: `#${channel.name}` }));
  }, [channels, configs, current, customerChannels]);

  const selectedChannelLabels = channelOptions
    .filter((option) => channelIds.includes(option.value))
    .map((option) => option.label);

  const { saveCustomerChannel, saving } = useSaveDiscordCustomerChannel({
    onCompleted: ({ operationDiscordSaveCustomerChannel: saved }) => {
      toast({
        title:
          saved.length === 1
            ? 'Customer channel updated'
            : `${saved.length} customer channels saved`,
      });
      onOpenChange(false);
    },
    onError: (error) => form.setError('root', { message: error.message }),
  });

  const { linkCustomerChannels, linking } = useLinkDiscordCustomerChannels({
    onCompleted: ({ operationDiscordLinkCustomerChannels: linked }) => {
      toast({
        title: `${linked.length} customer channel${
          linked.length === 1 ? '' : 's'
        } linked`,
      });
      onOpenChange(false);
    },
    onError: (error) => form.setError('root', { message: error.message }),
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
      setStep(1);
    }
  }, [defaultValues, form, open]);

  async function goToCompanyStep() {
    if (await form.trigger(['connectionId', 'channelIds'])) {
      setStep(2);
    }
  }

  function handleSubmit({
    channelIds: chosenIds,
    ...values
  }: TDiscordCustomerChannelForm) {
    if (!current) {
      linkCustomerChannels({ variables: { channelIds: chosenIds, ...values } });
      return;
    }

    const save = () =>
      saveCustomerChannel({
        variables: { _id: current._id, channelIds: chosenIds, ...values },
      });

    if (chosenIds.includes(current.channelId)) {
      save();
      return;
    }

    confirm({
      message: `Unlink #${current.channelName}? /triage new and /tasks stop working there, and updates on reports made there are no longer posted.`,
    }).then(save);
  }

  const rootError = form.formState.errors.root?.message;
  const submitting = saving || linking;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View aria-describedby={undefined}>
        <Form {...form}>
          <form
            className="flex flex-1 flex-col overflow-hidden"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <Sheet.Header>
              <Sheet.Title>
                {current ? 'Edit customer channel' : 'Link customer channels'}
              </Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>

            <Sheet.Content className="flex flex-col overflow-hidden">
              <IntegrationSteps step={step} steps={CHANNEL_STEPS} />
              <div className="flex flex-1 flex-col gap-4 overflow-auto p-4 pt-0">
                {rootError ? (
                  <Alert variant="destructive">
                    <Alert.Description>{rootError}</Alert.Description>
                  </Alert>
                ) : null}

                {step === 1 ? (
                  <ChannelsStep
                    form={form}
                    connections={connections}
                    channelOptions={channelOptions}
                    loading={channelsLoading}
                    error={channelsError?.message}
                    current={current}
                  />
                ) : (
                  <CompanyTeamStep
                    form={form}
                    selectedChannelLabels={selectedChannelLabels}
                  />
                )}
              </div>
            </Sheet.Content>

            <Sheet.Footer>
              <Sheet.Close asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="mr-auto text-muted-foreground"
                >
                  Cancel
                </Button>
              </Sheet.Close>
              <Button
                type="button"
                variant="secondary"
                className="bg-border"
                disabled={step === 1}
                onClick={() => setStep(1)}
              >
                Previous step
              </Button>
              {step === 1 ? (
                <Button
                  type="button"
                  disabled={channelsLoading || Boolean(channelsError)}
                  onClick={goToCompanyStep}
                >
                  Next step
                </Button>
              ) : (
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Spinner size="sm" /> : 'Save'}
                </Button>
              )}
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
}

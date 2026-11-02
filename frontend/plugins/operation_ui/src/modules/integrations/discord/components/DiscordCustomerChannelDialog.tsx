import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  Form,
  Select,
  Spinner,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { CompaniesInline, SelectCompany } from 'ui-modules';
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
  IDiscordChannel,
  IDiscordConfigSummary,
  IDiscordConnection,
  IDiscordCustomerChannel,
} from '../types';

const firstValue = (value: string | string[]) =>
  Array.isArray(value) ? (value[0] ?? '') : value;

const toggleValue = (values: string[], value: string, checked: boolean) =>
  checked
    ? [...values, value]
    : values.filter((existing) => existing !== value);

function CustomerChannelChecklist({
  channels,
  value,
  onChange,
  emptyMessage,
}: Readonly<{
  channels: IDiscordChannel[];
  value: string[];
  onChange: (value: string[]) => void;
  emptyMessage: string;
}>) {
  if (!channels.length) {
    return (
      <p className="rounded border border-border p-3 text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">Channels</legend>
      <div className="max-h-48 space-y-1 overflow-y-auto rounded border border-border p-2">
        {channels.map((channel) => (
          <label
            key={channel.id}
            className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-accent"
          >
            <Checkbox
              checked={value.includes(channel.id)}
              onCheckedChange={(checked) =>
                onChange(toggleValue(value, channel.id, checked === true))
              }
            />
            #{channel.name}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function DiscordCustomerChannelDialog({
  open,
  onClose,
  connections,
  configs,
  customerChannels,
  current,
  defaultCompanyId = '',
}: Readonly<{
  open: boolean;
  onClose: () => void;
  connections: IDiscordConnection[];
  configs: IDiscordConfigSummary[];
  customerChannels: IDiscordCustomerChannel[];
  current: IDiscordCustomerChannel | null;
  defaultCompanyId?: string;
}>) {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const defaultValues = useMemo<TDiscordCustomerChannelForm>(
    () => ({
      connectionId: current?.connectionId ?? connections[0]?._id ?? '',
      channelIds: current ? [current.channelId] : [],
      companyId: current?.companyId ?? defaultCompanyId,
      teamId: current?.teamId ?? '',
    }),
    [connections, current, defaultCompanyId],
  );

  const form = useForm<TDiscordCustomerChannelForm>({
    resolver: zodResolver(DISCORD_CUSTOMER_CHANNEL_SCHEMA),
    defaultValues,
  });
  const connectionId = form.watch('connectionId');
  const channelIds = form.watch('channelIds');
  const companyId = form.watch('companyId');
  const teamId = form.watch('teamId');
  const {
    channels,
    loading: channelsLoading,
    error: channelsError,
  } = useDiscordChannels(connectionId, !open);

  const unavailableChannelIds = new Set([
    ...configs.map((config) => config.channelId),
    ...customerChannels
      .filter((channel) => channel._id !== current?._id)
      .map((channel) => channel.channelId),
  ]);
  const availableChannels = channels.filter(
    (channel) => !unavailableChannelIds.has(channel.id),
  );
  const selectedChannelNames = channels
    .filter((channel) => channelIds.includes(channel.id))
    .map((channel) => `#${channel.name}`)
    .join(', ');

  const { saveCustomerChannel, saving } = useSaveDiscordCustomerChannel({
    onCompleted: ({ operationDiscordSaveCustomerChannel: saved }) => {
      toast({
        title:
          saved.length === 1
            ? 'Customer channel updated'
            : `${saved.length} customer channels saved`,
      });
      onClose();
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
      onClose();
    },
    onError: (error) => form.setError('root', { message: error.message }),
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, open]);

  function handleConnectionChange(value: string) {
    form.setValue('connectionId', value, { shouldValidate: true });
    form.setValue('channelIds', [], { shouldValidate: false });
  }

  function handleSubmit({
    channelIds: chosenIds,
    ...values
  }: TDiscordCustomerChannelForm) {
    if (current) {
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
      return;
    }

    linkCustomerChannels({ variables: { channelIds: chosenIds, ...values } });
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Content className="max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Dialog.Header>
              <Dialog.Title>
                {current ? 'Edit customer channel' : 'Link customer channels'}
              </Dialog.Title>
              <Dialog.Description>
                People in {current ? 'this channel' : 'these channels'} can
                report triages with /triage new and see the company’s tasks with
                /tasks.
              </Dialog.Description>
            </Dialog.Header>

            <div className="space-y-4 py-4">
              {form.formState.errors.root?.message ? (
                <Alert variant="destructive">
                  <Alert.Description>
                    {form.formState.errors.root.message}
                  </Alert.Description>
                </Alert>
              ) : null}

              <Form.Field
                control={form.control}
                name="connectionId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Discord server</Form.Label>
                    <Select
                      value={field.value}
                      onValueChange={handleConnectionChange}
                    >
                      <Form.Control>
                        <Select.Trigger className="border">
                          <Select.Value placeholder="Choose a server…" />
                        </Select.Trigger>
                      </Form.Control>
                      <Select.Content>
                        {connections.map((connection) => (
                          <Select.Item
                            key={connection._id}
                            value={connection._id}
                          >
                            {connection.guildName}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              {channelsError ? (
                <Alert variant="destructive">
                  <Alert.Description>{channelsError.message}</Alert.Description>
                </Alert>
              ) : null}

              <Form.Field
                control={form.control}
                name="channelIds"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Channels</Form.Label>
                    {channelsLoading && (
                      <div
                        className="flex h-8 w-full items-center gap-2 rounded border border-border px-3 text-sm text-muted-foreground"
                        aria-live="polite"
                      >
                        <Spinner
                          size="sm"
                          containerClassName="h-auto flex-none"
                        />
                        <span>Loading channels…</span>
                      </div>
                    )}
                    {!channelsLoading && (
                      <CustomerChannelChecklist
                        channels={availableChannels}
                        value={field.value}
                        onChange={field.onChange}
                        emptyMessage={
                          connectionId
                            ? 'Every channel the bot can see is already linked or posts a team’s updates.'
                            : 'Choose a server first.'
                        }
                      />
                    )}
                    <Form.Description>
                      {current
                        ? `Checked channels share this company and team. Unchecking #${current.channelName} unlinks it.`
                        : 'Channels that post a team’s internal updates or are linked to another company are hidden.'}
                    </Form.Description>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Company</Form.Label>
                    <SelectCompany
                      mode="single"
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(firstValue(value))
                      }
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="teamId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Team that receives triages</Form.Label>
                    <SelectTeam.FormItem
                      mode="single"
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(firstValue(value))
                      }
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />

              {selectedChannelNames && companyId && teamId ? (
                <div className="space-y-2 rounded-lg border border-border bg-accent/40 p-3 text-sm">
                  <p className="font-medium">
                    In {selectedChannelNames}, people from{' '}
                    <span className="inline-flex align-middle">
                      <CompaniesInline companyIds={[companyId]} />
                    </span>{' '}
                    can:
                  </p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>
                      <span className="font-mono text-foreground">
                        /triage new
                      </span>{' '}
                      — report an issue to{' '}
                      <TeamInline
                        teamId={teamId}
                        className="align-middle text-foreground"
                      />
                    </li>
                    <li>
                      <span className="font-mono text-foreground">/tasks</span>{' '}
                      — see the company’s open triages and tasks
                    </li>
                    <li>
                      Get a reply in the channel they reported from when their
                      reports are accepted, assigned, done or declined
                    </li>
                  </ul>
                </div>
              ) : null}
            </div>

            <Dialog.Footer>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  saving || linking || channelsLoading || Boolean(channelsError)
                }
              >
                {saving || linking ? <Spinner size="sm" /> : 'Save'}
              </Button>
            </Dialog.Footer>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
}

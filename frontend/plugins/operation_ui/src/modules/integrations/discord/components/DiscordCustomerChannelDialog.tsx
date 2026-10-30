import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Button,
  Dialog,
  Form,
  Select,
  Spinner,
  useToast,
} from 'erxes-ui';
import { CompaniesInline, SelectCompany } from 'ui-modules';
import { SelectTeam } from '@/team/components/SelectTeam';
import { TeamInline } from '@/team/components/TeamInline';
import { useDiscordChannels } from '../hooks/useDiscordIntegration';
import { useSaveDiscordCustomerChannel } from '../hooks/useDiscordCommands';
import {
  DISCORD_CUSTOMER_CHANNEL_SCHEMA,
  TDiscordCustomerChannelForm,
} from '../schemas';
import {
  IDiscordConfigSummary,
  IDiscordConnection,
  IDiscordCustomerChannel,
} from '../types';

const firstValue = (value: string | string[]) =>
  Array.isArray(value) ? value[0] ?? '' : value;

export function DiscordCustomerChannelDialog({
  open,
  onClose,
  connections,
  configs,
  customerChannels,
  current,
}: {
  open: boolean;
  onClose: () => void;
  connections: IDiscordConnection[];
  configs: IDiscordConfigSummary[];
  customerChannels: IDiscordCustomerChannel[];
  current: IDiscordCustomerChannel | null;
}) {
  const { toast } = useToast();
  const defaultValues = useMemo<TDiscordCustomerChannelForm>(
    () => ({
      connectionId: current?.connectionId ?? connections[0]?._id ?? '',
      channelId: current?.channelId ?? '',
      companyId: current?.companyId ?? '',
      teamId: current?.teamId ?? '',
    }),
    [connections, current],
  );

  const form = useForm<TDiscordCustomerChannelForm>({
    resolver: zodResolver(DISCORD_CUSTOMER_CHANNEL_SCHEMA),
    defaultValues,
  });
  const connectionId = form.watch('connectionId');
  const channelId = form.watch('channelId');
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
  const selectedChannelName = channels.find(
    (channel) => channel.id === channelId,
  )?.name;

  const { saveCustomerChannel, saving } = useSaveDiscordCustomerChannel({
    onCompleted: () => {
      toast({
        title: current ? 'Customer channel updated' : 'Customer channel linked',
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
    form.setValue('channelId', '', { shouldValidate: false });
  }

  function handleSubmit(values: TDiscordCustomerChannelForm) {
    saveCustomerChannel({
      variables: { _id: current?._id ?? null, ...values },
    });
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Content className="max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Dialog.Header>
              <Dialog.Title>
                {current ? 'Edit customer channel' : 'Link a customer channel'}
              </Dialog.Title>
              <Dialog.Description>
                People in this channel can report triages with /triage new and
                see the company’s tasks with /tasks.
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
                name="channelId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Channel</Form.Label>
                    {channelsLoading ? (
                      <div
                        className="flex h-8 w-full items-center gap-2 rounded border border-border px-3 text-sm text-muted-foreground"
                        role="status"
                      >
                        <Spinner
                          size="sm"
                          containerClassName="h-auto flex-none"
                        />
                        <span>Loading channels…</span>
                      </div>
                    ) : (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!connectionId || !availableChannels.length}
                      >
                        <Form.Control>
                          <Select.Trigger className="border">
                            <Select.Value placeholder="Choose a channel…" />
                          </Select.Trigger>
                        </Form.Control>
                        <Select.Content>
                          {availableChannels.map((channel) => (
                            <Select.Item key={channel.id} value={channel.id}>
                              #{channel.name}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    )}
                    <Form.Description>
                      Channels that post a team’s internal updates or are linked
                      to another company are hidden.
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

              {selectedChannelName && companyId && teamId ? (
                <div className="space-y-2 rounded-lg border border-border bg-accent/40 p-3 text-sm">
                  <p className="font-medium">
                    In #{selectedChannelName}, people from{' '}
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
                      Get a reply in this channel when their reports are
                      accepted, assigned, done or declined
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
                disabled={saving || channelsLoading || Boolean(channelsError)}
              >
                {saving ? <Spinner size="sm" /> : 'Save'}
              </Button>
            </Dialog.Footer>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
}

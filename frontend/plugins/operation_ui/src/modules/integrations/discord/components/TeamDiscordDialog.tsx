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
  Switch,
  useToast,
} from 'erxes-ui';
import {
  DISCORD_EVENT_OPTIONS,
  DISCORD_NOTIFICATION_EVENTS,
} from '../constants';
import {
  useDiscordChannels,
  useSaveDiscordTeamConfig,
} from '../hooks/useDiscordIntegration';
import { DISCORD_TEAM_CONFIG_SCHEMA, TDiscordTeamConfigForm } from '../schemas';
import { TeamDiscordDialogProps } from '../types';

export function TeamDiscordDialog({
  open,
  onClose,
  teamId,
  connections,
  currentConfig,
}: TeamDiscordDialogProps) {
  const { toast } = useToast();
  const defaultValues = useMemo<TDiscordTeamConfigForm>(() => {
    const hasCurrentConnection = connections.some(
      (connection) => connection._id === currentConfig?.connectionId,
    );

    return {
      connectionId: hasCurrentConnection
        ? currentConfig?.connectionId ?? ''
        : connections[0]?._id ?? '',
      channelId: hasCurrentConnection ? currentConfig?.channelId ?? '' : '',
      events: currentConfig?.events.length
        ? [...currentConfig.events]
        : [...DISCORD_NOTIFICATION_EVENTS],
      isActive: currentConfig?.isActive ?? true,
    };
  }, [connections, currentConfig]);

  const form = useForm<TDiscordTeamConfigForm>({
    resolver: zodResolver(DISCORD_TEAM_CONFIG_SCHEMA),
    defaultValues,
  });
  const connectionId = form.watch('connectionId');
  const {
    channels,
    loading: channelsLoading,
    error: channelsError,
  } = useDiscordChannels(connectionId, !open);
  const { saveTeamConfig, saving } = useSaveDiscordTeamConfig(teamId, {
    onCompleted: () => {
      toast({ title: 'Discord channel saved' });
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

  function handleSubmit(values: TDiscordTeamConfigForm) {
    saveTeamConfig({ variables: { teamId, ...values } });
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Content className="max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Dialog.Header>
              <Dialog.Title>Choose a Discord channel</Dialog.Title>
              <Dialog.Description>
                Pick where this team’s updates are posted and which ones.
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
                        disabled={!connectionId || !channels.length}
                      >
                        <Form.Control>
                          <Select.Trigger className="border">
                            <Select.Value placeholder="Choose a channel…" />
                          </Select.Trigger>
                        </Form.Control>
                        <Select.Content>
                          {channels.map((channel) => (
                            <Select.Item key={channel.id} value={channel.id}>
                              #{channel.name}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    )}
                    {!channelsLoading &&
                    !channelsError &&
                    connectionId &&
                    !channels.length ? (
                      <Form.Description>
                        The bot cannot see any text channel in this server.
                      </Form.Description>
                    ) : null}
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="events"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Events</Form.Label>
                    <div className="space-y-3 pt-1">
                      {DISCORD_EVENT_OPTIONS.map((option) => (
                        <label
                          key={option.value}
                          className="flex cursor-pointer items-start gap-3"
                        >
                          <Checkbox
                            className="mt-0.5"
                            checked={field.value.includes(option.value)}
                            onCheckedChange={(checked) =>
                              field.onChange(
                                checked === true
                                  ? [...field.value, option.value]
                                  : field.value.filter(
                                      (event) => event !== option.value,
                                    ),
                              )
                            }
                          />
                          <span>
                            <span className="block text-sm font-medium">
                              {option.label}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {option.description}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <Form.Item className="flex items-center justify-between gap-4 space-y-0">
                    <div>
                      <Form.Label>Send notifications</Form.Label>
                      <Form.Description>
                        Pause without losing the channel and events.
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

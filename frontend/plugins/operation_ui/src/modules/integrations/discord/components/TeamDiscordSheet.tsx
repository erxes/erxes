import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Button,
  Form,
  Select,
  Sheet,
  Spinner,
  Switch,
  useToast,
} from 'erxes-ui';
import { DISCORD_DEFAULT_EVENTS } from '../constants';
import {
  useDiscordChannels,
  useSaveDiscordTeamConfig,
} from '../hooks/useDiscordIntegration';
import { DISCORD_TEAM_CONFIG_SCHEMA, TDiscordTeamConfigForm } from '../schemas';
import { TeamDiscordSheetProps } from '../types';
import { TeamDiscordEvents } from './TeamDiscordEvents';

export function TeamDiscordSheet({
  open,
  onOpenChange,
  teamId,
  connections,
  currentConfig,
  takenChannelIds = [],
  githubRepoName,
}: Readonly<TeamDiscordSheetProps>) {
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
        : [...DISCORD_DEFAULT_EVENTS],
      mention: currentConfig?.mention ?? 'none',
      mentionEvents: currentConfig?.mentionEvents
        ? [...currentConfig.mentionEvents]
        : [],
      isActive: currentConfig?.isActive ?? true,
    };
  }, [connections, currentConfig]);

  const form = useForm<TDiscordTeamConfigForm>({
    resolver: zodResolver(DISCORD_TEAM_CONFIG_SCHEMA),
    defaultValues,
  });
  const connectionId = form.watch('connectionId');
  const channelId = form.watch('channelId');
  const {
    channels,
    loading: channelsLoading,
    error: channelsError,
  } = useDiscordChannels(connectionId, !open);
  const { saveTeamConfig, saving } = useSaveDiscordTeamConfig(teamId, {
    onCompleted: () => {
      toast({
        title: currentConfig
          ? 'Discord channel saved'
          : 'Discord channel added',
      });
      onOpenChange(false);
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
    saveTeamConfig({
      variables: {
        _id: currentConfig?._id,
        teamId,
        ...values,
        mentionEvents: values.mentionEvents.filter((event) =>
          values.events.includes(event),
        ),
      },
    });
  }

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
                {currentConfig
                  ? 'Edit Discord channel'
                  : 'Add a Discord channel'}
              </Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>

            <Sheet.Content className="flex flex-col gap-4 overflow-auto p-4">
              <p className="text-sm text-muted-foreground">
                Pick where this team’s updates are posted and which ones.
              </p>

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
                        <Select.Trigger>
                          <Select.Value placeholder="Select a server" />
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
                        aria-live="polite"
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
                          <Select.Trigger>
                            <Select.Value placeholder="Select a channel" />
                          </Select.Trigger>
                        </Form.Control>
                        <Select.Content>
                          {channels.map((channel) => {
                            const taken = takenChannelIds.includes(channel.id);

                            return (
                              <Select.Item
                                key={channel.id}
                                value={channel.id}
                                disabled={taken}
                              >
                                #{channel.name}
                                {taken ? ' · already added' : ''}
                              </Select.Item>
                            );
                          })}
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

              <TeamDiscordEvents
                form={form}
                githubRepoName={githubRepoName}
                channelName={
                  channels.find((channel) => channel.id === channelId)?.name
                }
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
                type="submit"
                disabled={saving || channelsLoading || Boolean(channelsError)}
              >
                {saving ? <Spinner size="sm" /> : 'Save'}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
}

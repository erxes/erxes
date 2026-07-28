import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconExternalLink,
  IconPlus,
} from '@tabler/icons-react';
import {
  Alert,
  Button,
  Form,
  Input,
  MultipleSelector,
  Select,
  Sheet,
  Spinner,
  type MultiSelectOption,
} from 'erxes-ui';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { SelectBrands } from 'ui-modules';
import { z } from 'zod';
import { IntegrationSteps } from '@/integrations/components/IntegrationSteps';
import { useIntegrationAdd } from '@/integrations/hooks/useIntegrationAdd';
import { IntegrationType } from '@/types/Integration';
import {
  buildDiscordInviteUrl,
  DISCORD_INTEGRATION_SCHEMA,
} from '../constants/discordSchema';
import {
  useDiscordBotChannels,
  useDiscordConnectedServers,
  useDiscordGuildChannels,
  useDiscordGuilds,
  useDiscordTakenChannels,
  useDiscordValidateToken,
} from '../hooks/useDiscordSetup';

type FormValues = z.infer<typeof DISCORD_INTEGRATION_SCHEMA>;

const STEP_DETAILS = [
  {
    title: 'Connect token',
    description:
      'Paste your bot token from the Discord Developer Portal to get started.',
  },
  {
    title: 'Pick server',
    description: 'Select the server where you want to integrate this bot.',
  },
  {
    title: 'Pick channels',
    description: 'Choose the channels and name this integration before saving.',
  },
];

// skipcq: JS-R1005
export const DiscordIntegrationDetail = () => {
  const { id: inboxChannelId } = useParams();
  const [open, setOpen] = useState(false);
  const { addIntegration, loading } = useIntegrationAdd();

  const [step, setStep] = useState(1);
  const [token, setToken] = useState('');
  const [guildId, setGuildId] = useState('');
  const [guildName, setGuildName] = useState('');
  const [channels, setChannels] = useState<MultiSelectOption[]>([]);
  const [existingBotId, setExistingBotId] = useState('');
  const isExistingMode = Boolean(existingBotId);

  const [validatedToken, setValidatedToken] = useState('');
  const {
    validate,
    validation,
    loading: validating,
  } = useDiscordValidateToken();
  const currentValidation =
    !validating && validatedToken === token.trim() ? validation : undefined;
  const { guilds, loading: guildsLoading } = useDiscordGuilds(
    token,
    step !== 2 || !currentValidation?.valid,
  );
  const { channels: guildChannels, loading: guildChannelsLoading } =
    useDiscordGuildChannels(
      token,
      guildId,
      step !== 3 || !guildId || isExistingMode,
    );
  const { channels: botChannels, loading: botChannelsLoading } =
    useDiscordBotChannels(existingBotId, step !== 3 || !isExistingMode);

  const { connectedServers } = useDiscordConnectedServers(inboxChannelId);
  const { takenChannelIds: takenChannelIdList } =
    useDiscordTakenChannels(inboxChannelId);

  const takenChannelIds = useMemo(
    () => new Set(takenChannelIdList),
    [takenChannelIdList],
  );

  const discordChannels = useMemo(
    () =>
      (isExistingMode ? botChannels : guildChannels).filter(
        (channel) => !takenChannelIds.has(channel.id),
      ),
    [isExistingMode, botChannels, guildChannels, takenChannelIds],
  );
  const channelsLoading = isExistingMode
    ? botChannelsLoading
    : guildChannelsLoading;

  const channelOptions = useMemo(
    () =>
      discordChannels.map((channel) => ({
        value: channel.id,
        label: `#${channel.name}`,
        category: channel.parentName || 'Uncategorized',
      })),
    [discordChannels],
  );

  const channelLabelById = useMemo(
    () => new Map(channelOptions.map((option) => [option.value, option.label])),
    [channelOptions],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(DISCORD_INTEGRATION_SCHEMA),
    defaultValues: { name: '', brandId: '' },
  });

  const reset = () => {
    setStep(1);
    setToken('');
    setValidatedToken('');
    setGuildId('');
    setGuildName('');
    setChannels([]);
    setExistingBotId('');
    form.reset();
  };

  useEffect(() => {
    setGuildId('');
    setGuildName('');
    setChannels([]);
    setExistingBotId('');
  }, [token]);

  const onSubmit = async (values: FormValues) => {
    if ((!isExistingMode && !currentValidation?.valid) || !channels.length) {
      return;
    }

    try {
      for (const channel of channels) {
        const channelName = channel.label.replace(/^#/, '');
        const displayName = `${values.name} - #${channelName}`;
        await addIntegration({
          variables: {
            kind: IntegrationType.DISCORD_MESSENGER,
            name: displayName,
            channelId: inboxChannelId as string,
            brandId: values.brandId,
            data: {
              name: displayName,
              ...(isExistingMode
                ? { sourceBotId: existingBotId }
                : {
                    token,
                    applicationId: currentValidation?.applicationId,
                  }),
              guildId: guildId || undefined,
              guildName: guildName || undefined,
              channelId: channel.value,
            },
          },
        });
      }

      setOpen(false);
      reset();
    } catch {
      // error toast is surfaced by useIntegrationAdd
    }
  };

  const inviteUrl =
    currentValidation?.valid && currentValidation.applicationId
      ? buildDiscordInviteUrl(currentValidation.applicationId)
      : undefined;

  let serverStepContent: React.ReactNode;
  if (guildsLoading) {
    serverStepContent = (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner size="sm" /> Loading servers…
      </div>
    );
  } else if (guilds.length) {
    serverStepContent = (
      <Select
        value={guildId}
        onValueChange={(value) => {
          setGuildId(value);
          setGuildName(guilds.find((g) => g.id === value)?.name || '');
        }}
      >
        <Select.Trigger id="discord-server">
          <Select.Value placeholder="Select a server" />
        </Select.Trigger>
        <Select.Content>
          {guilds.map((g) => (
            <Select.Item key={g.id} value={g.id}>
              {g.name}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    );
  } else {
    serverStepContent = (
      <Alert variant="warning">
        <IconAlertTriangle className="size-4" />
        <Alert.Title>This bot isn&apos;t in any server</Alert.Title>
        <Alert.Description>
          Use “Add this bot to a server” on the previous step, then come back.
        </Alert.Description>
      </Alert>
    );
  }

  return (
    // skipcq: JS-0415
    <div>
      <Sheet
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) reset();
        }}
      >
        <Sheet.Trigger asChild>
          <Button>
            <IconPlus />
            Add Discord bot
          </Button>
        </Sheet.Trigger>
        <Sheet.View>
          <Form {...form}>
            <form
              className="flex flex-col flex-1 overflow-hidden"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <Sheet.Header>
                <Sheet.Title>Add Discord bot</Sheet.Title>
                <Sheet.Description>
                  Connect a Discord bot to manage your Discord channel messages
                  right from your Team Inbox.
                </Sheet.Description>
                <Sheet.Close />
              </Sheet.Header>

              <Sheet.Content className="flex flex-col overflow-hidden">
                <IntegrationSteps
                  step={step}
                  title={STEP_DETAILS[step - 1].title}
                  stepsLength={3}
                  description={STEP_DETAILS[step - 1].description}
                />
                <div className="flex-1 overflow-auto p-4 pt-0 flex flex-col gap-4">
                  {step === 1 && (
                    <div className="flex flex-col gap-3">
                      <label
                        htmlFor="discord-bot-token"
                        className="text-sm font-medium"
                      >
                        Bot token
                      </label>
                      <Input
                        id="discord-bot-token"
                        type="password"
                        value={token}
                        placeholder="Paste your bot token"
                        onChange={(e) => setToken(e.target.value)}
                        onBlur={() => {
                          const trimmed = token.trim();
                          if (!trimmed) return;
                          setValidatedToken(trimmed);
                          validate(trimmed);
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        From the Discord Developer Portal → Bot. We&apos;ll
                        verify it and fill in the rest automatically.
                      </p>

                      {validating && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Spinner size="sm" /> Verifying token…
                        </div>
                      )}

                      {currentValidation?.valid && (
                        <Alert variant="default">
                          <IconCircleCheck className="size-4 text-green-600" />
                          <Alert.Title>
                            Connected as {currentValidation.botUsername}
                          </Alert.Title>
                          <Alert.Description>
                            Application ID and public key detected
                            automatically.
                          </Alert.Description>
                        </Alert>
                      )}

                      {currentValidation?.valid &&
                        currentValidation.hasMessageContentIntent === false && (
                          <Alert variant="warning">
                            <IconAlertTriangle className="size-4" />
                            <Alert.Title>
                              MESSAGE CONTENT intent is off
                            </Alert.Title>
                            <Alert.Description>
                              Enable it in the Developer Portal → Bot, or
                              incoming messages will arrive empty.
                            </Alert.Description>
                          </Alert>
                        )}

                      {currentValidation && !currentValidation.valid && (
                        <Alert variant="destructive">
                          <IconAlertTriangle className="size-4" />
                          <Alert.Title>Invalid token</Alert.Title>
                          <Alert.Description>
                            {currentValidation.error ||
                              'Discord rejected this token. Double-check it and try again.'}
                          </Alert.Description>
                        </Alert>
                      )}

                      {inviteUrl && (
                        <a
                          href={inviteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <IconExternalLink className="size-4" />
                          Add this bot to a server
                        </a>
                      )}

                      {connectedServers.length > 0 && (
                        <div className="flex flex-col gap-2 pt-2">
                          <div className="flex items-center gap-2">
                            <div className="h-px flex-1 bg-border" />
                            <span className="text-xs text-muted-foreground">
                              or
                            </span>
                            <div className="h-px flex-1 bg-border" />
                          </div>
                          <label
                            htmlFor="discord-connected-server"
                            className="text-sm font-medium"
                          >
                            Add channels to a connected server
                          </label>
                          <Select
                            value=""
                            onValueChange={(botId) => {
                              const server = connectedServers.find(
                                (s) => s.botId === botId,
                              );
                              if (!server) return;
                              setChannels([]);
                              setGuildId(server.guildId);
                              setGuildName(server.guildName || '');
                              setExistingBotId(botId);
                              setStep(3);
                            }}
                          >
                            <Select.Trigger id="discord-connected-server">
                              <Select.Value placeholder="Select a connected server" />
                            </Select.Trigger>
                            <Select.Content>
                              {connectedServers.map((server) => (
                                <Select.Item
                                  key={server.botId}
                                  value={server.botId}
                                >
                                  {server.guildName || server.guildId}
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Skip the token step and pick more channels for a bot
                            you&apos;ve already connected.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {step === 2 && (
                    <div className="flex flex-col gap-3">
                      <label
                        htmlFor="discord-server"
                        className="text-sm font-medium"
                      >
                        Server
                      </label>
                      {serverStepContent}
                    </div>
                  )}

                  {step === 3 && (
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="discord-channels"
                            className="text-sm font-medium"
                          >
                            Discord channels
                          </label>
                          {channelOptions.length > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-auto px-1 text-xs text-primary"
                              onClick={() => {
                                setChannels(
                                  channels.length === channelOptions.length
                                    ? []
                                    : channelOptions,
                                );
                              }}
                            >
                              {channels.length === channelOptions.length
                                ? 'Clear all'
                                : 'Select all'}
                            </Button>
                          )}
                        </div>
                        <MultipleSelector
                          inputProps={{ id: 'discord-channels' }}
                          value={channels}
                          onChange={setChannels}
                          options={channelOptions}
                          groupBy="category"
                          commandProps={{
                            filter: (value, search) => {
                              const label = channelLabelById.get(value) ?? '';
                              return label
                                .toLowerCase()
                                .includes(search.trim().toLowerCase())
                                ? 1
                                : 0;
                            },
                          }}
                          placeholder={
                            channelsLoading
                              ? 'Loading channels…'
                              : 'Select one or more channels'
                          }
                          emptyIndicator={
                            <p className="text-center text-sm text-muted-foreground py-2">
                              No text channels found
                            </p>
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          One integration is created per channel, all sharing
                          this bot.
                        </p>
                      </div>

                      <Form.Field
                        name="name"
                        render={({ field }) => (
                          <Form.Item>
                            <Form.Label>Integration name</Form.Label>
                            <Form.Control>
                              <Input {...field} />
                            </Form.Control>
                            <Form.Description>
                              Used as a prefix; each integration is named “
                              {'{name}'} - #channel”.
                            </Form.Description>
                            <Form.Message />
                          </Form.Item>
                        )}
                      />

                      <Form.Field
                        name="brandId"
                        render={({ field }) => (
                          <Form.Item>
                            <Form.Label>Brand</Form.Label>
                            <Form.Control>
                              <SelectBrands.FormItem
                                value={field.value}
                                onValueChange={field.onChange}
                              />
                            </Form.Control>
                            <Form.Message />
                          </Form.Item>
                        )}
                      />
                    </div>
                  )}
                </div>
              </Sheet.Content>

              <Sheet.Footer>
                <Sheet.Close asChild>
                  <Button
                    className="mr-auto text-muted-foreground"
                    variant="ghost"
                    type="button"
                  >
                    Cancel
                  </Button>
                </Sheet.Close>

                <Button
                  variant="secondary"
                  className="bg-border"
                  type="button"
                  disabled={step === 1}
                  onClick={() => {
                    if (isExistingMode) {
                      setExistingBotId('');
                      setGuildId('');
                      setGuildName('');
                      setChannels([]);
                      setStep(1);
                      return;
                    }
                    setStep((s) => s - 1);
                  }}
                >
                  Previous step
                </Button>

                {step < 3 ? (
                  <Button
                    type="button"
                    disabled={
                      (step === 1 && !currentValidation?.valid) ||
                      (step === 2 && !guildId)
                    }
                    onClick={() => setStep((s) => s + 1)}
                  >
                    Next step
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading || !channels.length}>
                    Save
                  </Button>
                )}
              </Sheet.Footer>
            </form>
          </Form>
        </Sheet.View>
      </Sheet>
    </div>
  );
};

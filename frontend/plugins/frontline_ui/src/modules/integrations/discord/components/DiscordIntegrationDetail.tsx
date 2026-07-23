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
    description:
      'Choose the channels and name this integration before saving.',
  },
];

// skipcq: JS-R1005 — multi-step connect wizard (token → guild → channels →
// submit); the step branches read clearer inline than split across helpers.
export const DiscordIntegrationDetail = () => {
  const { id: inboxChannelId } = useParams();
  const [open, setOpen] = useState(false);
  const { addIntegration, loading } = useIntegrationAdd();

  const [step, setStep] = useState(1);
  const [token, setToken] = useState('');
  const [guildId, setGuildId] = useState('');
  // Captured at selection time (the guilds query is skipped on later steps) so
  // the server's display name can be stored with the integration — the sidebar
  // groups channels under it.
  const [guildName, setGuildName] = useState('');
  const [channels, setChannels] = useState<MultiSelectOption[]>([]);
  // Set when adding channels to an already-connected server: holds a
  // representative bot id of that server. Its presence means "existing-server
  // mode" — the token/server steps are skipped and channels are resolved
  // server-side (this bot's token is never handled by the client).
  const [existingBotId, setExistingBotId] = useState('');
  const isExistingMode = Boolean(existingBotId);

  // useLazyQuery's `data` only updates once a new call resolves, so it still
  // holds the previous token's result right after the user edits the token —
  // tracking which token it belongs to lets us tell a current result from a
  // stale one instead of trusting `validation.valid` (and its `applicationId`)
  // blindly across a token edit.
  const [validatedToken, setValidatedToken] = useState('');
  const { validate, validation, loading: validating } =
    useDiscordValidateToken();
  const currentValidation =
    !validating && validatedToken === token.trim() ? validation : undefined;
  const { guilds, loading: guildsLoading } = useDiscordGuilds(
    token,
    step !== 2 || !currentValidation?.valid,
  );
  // Channel sources: a pasted token resolves them via the guild; an existing
  // server resolves them server-side by bot id (no token on the client).
  const { channels: guildChannels, loading: guildChannelsLoading } =
    useDiscordGuildChannels(
      token,
      guildId,
      step !== 3 || !guildId || isExistingMode,
    );
  const { channels: botChannels, loading: botChannelsLoading } =
    useDiscordBotChannels(existingBotId, step !== 3 || !isExistingMode);

  // Both the connected-server picker and the taken-channel filter are resolved
  // server-side, scoped to THIS inbox channel — so the wizard never loads every
  // bot in the system nor pages every integration on the channel just to derive
  // these small per-channel sets.
  const { connectedServers } = useDiscordConnectedServers(inboxChannelId);
  const { takenChannelIds: takenChannelIdList } =
    useDiscordTakenChannels(inboxChannelId);

  // Discord channels already added to this inbox channel — excluded from the
  // picker so the same channel can't be added here twice. Scoped to the inbox
  // channel (not the guild), so a channel routed to a *different* inbox channel
  // stays addable here.
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

  // Picker options, grouped under their Discord category (server order is
  // preserved from the backend, so categories/channels stay in Discord's order).
  const channelOptions = useMemo(
    () =>
      discordChannels.map((channel) => ({
        value: channel.id,
        label: `#${channel.name}`,
        category: channel.parentName || 'Uncategorized',
      })),
    [discordChannels],
  );

  // Options carry the channel id as their value, so the picker's default filter
  // (which matches the typed text against that id) never matches a name. Map
  // id → label so search can match the channel name instead.
  const channelLabelById = useMemo(
    () => new Map(channelOptions.map((option) => [option.value, option.label])),
    [channelOptions],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(DISCORD_INTEGRATION_SCHEMA),
    defaultValues: { name: '', brandId: '' },
  });

  /** Reset the setup wizard to its first step. */
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

  // Validating a token can invalidate a later choice; keep state consistent
  // when the user edits the token after advancing. Typing a token also means
  // "new bot", so drop any connected-server selection.
  useEffect(() => {
    setGuildId('');
    setGuildName('');
    setChannels([]);
    setExistingBotId('');
  }, [token]);

  /** Create the Discord integration from the wizard values. */
  const onSubmit = async (values: FormValues) => {
    // New bot needs a valid token; existing-server mode reuses the source bot's.
    if ((!isExistingMode && !currentValidation?.valid) || !channels.length) {
      return;
    }

    try {
      // One inbox integration per Discord channel (all sharing the same bot
      // token) so each channel can route to this Team Inbox channel.
      for (const channel of channels) {
        const channelName = channel.label.replace(/^#/, '');
        // Always suffix the channel — single or batch — so every integration is
        // identifiable by its channel and the sidebar can parse "#channel" (and
        // the shared name prefix) from it consistently.
        const displayName = `${values.name} - #${channelName}`;
        await addIntegration({
          variables: {
            kind: IntegrationType.DISCORD_MESSENGER,
            name: displayName,
            channelId: inboxChannelId as string,
            brandId: values.brandId,
            data: {
              name: displayName,
              // Existing server: reference the source bot so the backend reuses
              // its token/application id. New bot: pass the validated token.
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
                  {/* ── Step 1: token ─────────────────────────────────── */}
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
                              // Jump straight to channel picking with this
                              // server's token resolved server-side.
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

                  {/* ── Step 2: server ────────────────────────────────── */}
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

                  {/* ── Step 3: channels + details ────────────────────── */}
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
                            // Match the search against the channel name, not the
                            // id the option value holds.
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
                              Used as a prefix; each integration is named
                              “{'{name}'} - #channel”.
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
                    // In existing-server mode step 2 was skipped, so go back to
                    // the start and drop the connected-server selection.
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

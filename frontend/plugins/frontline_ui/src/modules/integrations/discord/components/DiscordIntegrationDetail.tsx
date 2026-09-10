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
  Combobox,
  Command,
  Form,
  Input,
  MultipleSelector,
  Popover,
  Select,
  Sheet,
  Spinner,
  type MultiSelectOption,
} from 'erxes-ui';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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
  useDiscordNamePresets,
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

const NAME_PLACEHOLDER = 'e.g. Enterprise Support';

const IntegrationNamePicker = ({
  value,
  onChange,
  presets,
}: {
  value: string;
  onChange: (value: string) => void;
  presets: string[];
}) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);

  const query = value.trim().toLowerCase();
  const matches = query
    ? presets.filter((preset) => preset.toLowerCase().includes(query))
    : presets;
  const exactMatch = presets.some((preset) => preset.toLowerCase() === query);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Form.Control>
        <Combobox.Trigger className="w-full shadow-xs">
          <Combobox.Value
            value={value}
            placeholder={t('discord-name-placeholder', NAME_PLACEHOLDER)}
          />
        </Combobox.Trigger>
      </Form.Control>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.Input
            value={value}
            onValueChange={onChange}
            placeholder={t(
              'discord-type-or-reuse-name',
              'Type a new name or reuse an existing one',
            )}
            focusOnMount
          />
          <Command.List>
            {value.trim() && !exactMatch && (
              <Command.Item
                value={`use:${value.trim()}`}
                onSelect={() => setOpen(false)}
                className="font-medium"
              >
                <IconPlus />
                Use “{value.trim()}”
              </Command.Item>
            )}
            {matches.length > 0 && (
              <Command.Group
                heading={t('reuse-a-previous-name', 'Reuse a previous name')}
              >
                {matches.map((preset) => (
                  <Command.Item
                    key={preset}
                    value={preset}
                    onSelect={() => {
                      onChange(preset);
                      setOpen(false);
                    }}
                  >
                    <span className="flex-auto truncate">{preset}</span>
                    <Combobox.Check checked={value.trim() === preset} />
                  </Command.Item>
                ))}
              </Command.Group>
            )}
            {!value.trim() && presets.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t('no-saved-names-yet', 'No saved names yet.')}
              </p>
            )}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

// skipcq: JS-R1005
export const DiscordIntegrationDetail = () => {
  const { t } = useTranslation('frontline');
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
  const { namePresets, refetch: refetchNamePresets } =
    useDiscordNamePresets(inboxChannelId);

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

    const failed: MultiSelectOption[] = [];

    for (const channel of channels) {
      const channelName = channel.label.replace(/^#/, '');
      const displayName = `${values.name} - #${channelName}`;
      try {
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
      } catch {
        failed.push(channel);
      }
    }

    void refetchNamePresets();

    if (failed.length) {
      setChannels(failed);
      return;
    }

    setOpen(false);
    reset();
  };

  const inviteUrl =
    currentValidation?.valid && currentValidation.applicationId
      ? buildDiscordInviteUrl(currentValidation.applicationId)
      : undefined;

  let serverStepContent: React.ReactNode;
  if (guildsLoading) {
    serverStepContent = (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner size="sm" /> {t('discord-loading-servers', 'Loading servers…')}
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
          <Select.Value
            placeholder={t('discord-select-a-server', 'Select a server')}
          />
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
        <Alert.Title>
          {t('discord-bot-not-in-server', "This bot isn't in any server")}
        </Alert.Title>
        <Alert.Description>
          {t(
            'discord-add-bot-to-server-hint',
            'Use "Add this bot to a server" on the previous step, then come back.',
          )}
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
            {t('discord-add-bot', 'Add Discord bot')}
          </Button>
        </Sheet.Trigger>
        <Sheet.View>
          <Form {...form}>
            <form
              className="flex flex-col flex-1 overflow-hidden"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <Sheet.Header>
                <Sheet.Title>
                  {t('discord-add-bot', 'Add Discord bot')}
                </Sheet.Title>
                <Sheet.Description>
                  {t(
                    'discord-add-bot-description',
                    'Connect a Discord bot to manage your Discord channel messages right from your Team Inbox.',
                  )}
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
                        {t('discord-bot-token', 'Bot token')}
                      </label>
                      <Input
                        id="discord-bot-token"
                        type="password"
                        value={token}
                        placeholder={t(
                          'discord-paste-bot-token',
                          'Paste your bot token',
                        )}
                        onChange={(e) => setToken(e.target.value)}
                        onBlur={() => {
                          const trimmed = token.trim();
                          if (!trimmed) return;
                          setValidatedToken(trimmed);
                          validate(trimmed);
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        {t(
                          'discord-bot-token-hint',
                          "From the Discord Developer Portal → Bot. We'll verify it and fill in the rest automatically.",
                        )}
                      </p>

                      {validating && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Spinner size="sm" />{' '}
                          {t('discord-verifying-token', 'Verifying token…')}
                        </div>
                      )}

                      {currentValidation?.valid && (
                        <Alert variant="default">
                          <IconCircleCheck className="size-4 text-green-600" />
                          <Alert.Title>
                            {t(
                              'discord-connected-as',
                              'Connected as {{botUsername}}',
                              {
                                botUsername: currentValidation.botUsername,
                              },
                            )}
                          </Alert.Title>
                          <Alert.Description>
                            {t(
                              'discord-app-id-detected',
                              'Application ID and public key detected automatically.',
                            )}
                          </Alert.Description>
                        </Alert>
                      )}

                      {currentValidation?.valid &&
                        currentValidation.hasMessageContentIntent === false && (
                          <Alert variant="warning">
                            <IconAlertTriangle className="size-4" />
                            <Alert.Title>
                              {t(
                                'discord-message-content-intent-off',
                                'MESSAGE CONTENT intent is off',
                              )}
                            </Alert.Title>
                            <Alert.Description>
                              {t(
                                'discord-enable-message-content-intent',
                                'Enable it in the Developer Portal → Bot, or incoming messages will arrive empty.',
                              )}
                            </Alert.Description>
                          </Alert>
                        )}

                      {currentValidation && !currentValidation.valid && (
                        <Alert variant="destructive">
                          <IconAlertTriangle className="size-4" />
                          <Alert.Title>
                            {t('discord-invalid-token', 'Invalid token')}
                          </Alert.Title>
                          <Alert.Description>
                            {currentValidation.error ||
                              t(
                                'discord-token-rejected',
                                'Discord rejected this token. Double-check it and try again.',
                              )}
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
                          {t(
                            'discord-add-bot-to-server',
                            'Add this bot to a server',
                          )}
                        </a>
                      )}

                      {connectedServers.length > 0 && (
                        <div className="flex flex-col gap-2 pt-2">
                          <div className="flex items-center gap-2">
                            <div className="h-px flex-1 bg-border" />
                            <span className="text-xs text-muted-foreground">
                              {t('discord-or-separator', 'or')}
                            </span>
                            <div className="h-px flex-1 bg-border" />
                          </div>
                          <label
                            htmlFor="discord-connected-server"
                            className="text-sm font-medium"
                          >
                            {t(
                              'discord-add-channels-to-connected-server',
                              'Add channels to a connected server',
                            )}
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
                              <Select.Value
                                placeholder={t(
                                  'discord-select-connected-server',
                                  'Select a connected server',
                                )}
                              />
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
                            {t(
                              'discord-skip-token-step-hint',
                              "Skip the token step and pick more channels for a bot you've already connected.",
                            )}
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
                        {t('server', 'Server')}
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
                            {t('discord-channels', 'Discord channels')}
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
                                ? t('clear-all', 'Clear all')
                                : t('select-all', 'Select all')}
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
                              ? t(
                                  'discord-loading-channels',
                                  'Loading channels…',
                                )
                              : t(
                                  'discord-select-one-or-more-channels',
                                  'Select one or more channels',
                                )
                          }
                          emptyIndicator={
                            <p className="text-center text-sm text-muted-foreground py-2">
                              {t(
                                'discord-no-text-channels-found',
                                'No text channels found',
                              )}
                            </p>
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          {t(
                            'discord-integration-per-channel-hint',
                            'One integration is created per channel, all sharing this bot.',
                          )}
                        </p>
                      </div>

                      <Form.Field
                        name="name"
                        render={({ field }) => (
                          <Form.Item>
                            <Form.Label>
                              {t(
                                'discord-integration-name',
                                'Integration name',
                              )}
                            </Form.Label>
                            {namePresets.length > 0 ? (
                              <IntegrationNamePicker
                                value={field.value}
                                onChange={field.onChange}
                                presets={namePresets}
                              />
                            ) : (
                              <Form.Control>
                                <Input
                                  {...field}
                                  placeholder={NAME_PLACEHOLDER}
                                />
                              </Form.Control>
                            )}
                            <Form.Description>
                              {t(
                                'discord-integration-name-description',
                                'Used as a prefix; each integration is named "{name} - #channel".',
                              )}
                            </Form.Description>
                            <Form.Message />
                          </Form.Item>
                        )}
                      />

                      <Form.Field
                        name="brandId"
                        render={({ field }) => (
                          <Form.Item>
                            <Form.Label>{t('brand', 'Brand')}</Form.Label>
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
                    {t('cancel', 'Cancel')}
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
                  {t('previous-step', 'Previous step')}
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
                    {t('next-step', 'Next step')}
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading || !channels.length}>
                    {t('save', 'Save')}
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

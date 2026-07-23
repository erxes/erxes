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
import { useEffect, useState } from 'react';
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
  useDiscordGuildChannels,
  useDiscordGuilds,
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
  const { channels: discordChannels, loading: channelsLoading } =
    useDiscordGuildChannels(token, guildId, step !== 3 || !guildId);

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
    form.reset();
  };

  // Validating a token can invalidate a later choice; keep state consistent
  // when the user edits the token after advancing.
  useEffect(() => {
    setGuildId('');
    setGuildName('');
    setChannels([]);
  }, [token]);

  /** Create the Discord integration from the wizard values. */
  const onSubmit = async (values: FormValues) => {
    if (!currentValidation?.valid || !channels.length) {
      return;
    }

    const multi = channels.length > 1;

    try {
      // One inbox integration per Discord channel (all sharing the same bot
      // token) so each channel can route to this Team Inbox channel.
      for (const channel of channels) {
        const channelName = channel.label.replace(/^#/, '');
        await addIntegration({
          variables: {
            kind: IntegrationType.DISCORD_MESSENGER,
            name: multi ? `${values.name} - #${channelName}` : values.name,
            channelId: inboxChannelId as string,
            brandId: values.brandId,
            data: {
              name: multi ? `${values.name} - #${channelName}` : values.name,
              token,
              applicationId: currentValidation.applicationId,
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
                          {discordChannels.length > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-auto px-1 text-xs text-primary"
                              onClick={() => {
                                const allOptions = discordChannels.map((c) => ({
                                  value: c.id,
                                  label: `#${c.name}`,
                                }));
                                setChannels(
                                  channels.length === allOptions.length
                                    ? []
                                    : allOptions,
                                );
                              }}
                            >
                              {channels.length === discordChannels.length
                                ? 'Clear all'
                                : 'Select all'}
                            </Button>
                          )}
                        </div>
                        <MultipleSelector
                          inputProps={{ id: 'discord-channels' }}
                          value={channels}
                          onChange={setChannels}
                          options={discordChannels.map((c) => ({
                            value: c.id,
                            label: `#${c.name}`,
                          }))}
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
                              Used as-is for a single channel, or as a prefix
                              when several are selected.
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
                  onClick={() => setStep((s) => s - 1)}
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

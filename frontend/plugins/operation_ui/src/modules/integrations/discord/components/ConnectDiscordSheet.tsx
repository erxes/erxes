import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconExternalLink,
  IconRefresh,
} from '@tabler/icons-react';
import { useForm, UseFormReturn } from 'react-hook-form';
import {
  Alert,
  Badge,
  Button,
  Form,
  Input,
  Select,
  Sheet,
  Spinner,
  useToast,
} from 'erxes-ui';
import { IntegrationSteps } from '@/integrations/components/IntegrationSteps';
import {
  DISCORD_BOT_PERMISSIONS,
  DISCORD_DEVELOPER_PORTAL_URL,
} from '../constants';
import {
  useConnectDiscord,
  useDiscordTokenCheck,
} from '../hooks/useDiscordIntegration';
import { DISCORD_CONNECT_SCHEMA, TDiscordConnectForm } from '../schemas';
import {
  ConnectDiscordSheetProps,
  IDiscordConnection,
  IDiscordTokenCheck,
} from '../types';

const EMPTY_FORM: TDiscordConnectForm = { token: '', guildId: '' };

const CONNECT_STEPS = [
  {
    title: 'Connect token',
    description:
      'Paste your bot token from the Discord Developer Portal to get started.',
  },
  {
    title: 'Pick server',
    description: 'Choose the server where erxes posts with this bot.',
  },
] as const;

const describeCommands = (
  connection: Pick<
    IDiscordConnection,
    'commandsRegisteredAt' | 'commandsError'
  > | null,
) => {
  if (connection?.commandsRegisteredAt) {
    return '/triage new and /tasks are on for its customer channels.';
  }

  return connection?.commandsError
    ? `Slash commands are off: ${connection.commandsError}`
    : undefined;
};

function BotInviteLink({ inviteUrl }: Readonly<{ inviteUrl: string }>) {
  return (
    <a
      href={inviteUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
    >
      <IconExternalLink className="size-4" />
      Add this bot to a server
    </a>
  );
}

function TokenStep({
  form,
  checking,
  tokenCheck,
  checkError,
  onVerify,
}: Readonly<{
  form: UseFormReturn<TDiscordConnectForm>;
  checking: boolean;
  tokenCheck?: IDiscordTokenCheck;
  checkError?: string;
  onVerify: () => void;
}>) {
  return (
    <div className="flex flex-col gap-3">
      <Form.Field
        control={form.control}
        name="token"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Bot token</Form.Label>
            <Form.Control>
              <Input
                {...field}
                type="password"
                autoComplete="off"
                placeholder="Paste your bot token"
                onBlur={() => {
                  field.onBlur();
                  onVerify();
                }}
              />
            </Form.Control>
            <Form.Description>
              From the{' '}
              <a
                href={DISCORD_DEVELOPER_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Discord Developer Portal
              </a>{' '}
              → Bot. It is stored on the server and never shown again.
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />

      {checking ? (
        <div
          className="flex items-center gap-2 text-sm text-muted-foreground"
          aria-live="polite"
        >
          <Spinner size="sm" containerClassName="h-auto flex-none" />
          Verifying token…
        </div>
      ) : null}

      {!checking && tokenCheck ? (
        <Alert>
          <IconCircleCheck className="size-4 text-success" />
          <Alert.Title>Connected as {tokenCheck.botUsername}</Alert.Title>
          <Alert.Description>
            {tokenCheck.guilds.length
              ? `The bot is in ${tokenCheck.guilds.length} server${
                  tokenCheck.guilds.length === 1 ? '' : 's'
                }.`
              : 'The bot is not in any server yet.'}
          </Alert.Description>
        </Alert>
      ) : null}

      {!checking && checkError ? (
        <Alert variant="destructive">
          <IconAlertTriangle className="size-4" />
          <Alert.Title>Invalid token</Alert.Title>
          <Alert.Description>{checkError}</Alert.Description>
        </Alert>
      ) : null}

      {tokenCheck ? <BotInviteLink inviteUrl={tokenCheck.inviteUrl} /> : null}
    </div>
  );
}

function ServerStep({
  form,
  tokenCheck,
  checking,
  onRefresh,
}: Readonly<{
  form: UseFormReturn<TDiscordConnectForm>;
  tokenCheck?: IDiscordTokenCheck;
  checking: boolean;
  onRefresh: () => void;
}>) {
  const guilds = tokenCheck?.guilds ?? [];

  return (
    <div className="flex flex-col gap-4">
      <Form.Field
        control={form.control}
        name="guildId"
        render={({ field }) => (
          <Form.Item>
            <div className="flex items-center justify-between">
              <Form.Label>Server</Form.Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={checking}
              >
                {checking ? <Spinner size="sm" /> : <IconRefresh />}
                Refresh
              </Button>
            </div>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={!guilds.length}
            >
              <Form.Control>
                <Select.Trigger>
                  <Select.Value placeholder="Select a server" />
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                {guilds.map((guild) => (
                  <Select.Item key={guild.id} value={guild.id}>
                    {guild.name}
                    {guild.isConnected ? (
                      <Badge variant="secondary" className="ml-2">
                        Connected
                      </Badge>
                    ) : null}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            {guilds.length ? (
              <Form.Description>
                Choosing a connected server updates its bot token.
              </Form.Description>
            ) : null}
            <Form.Message />
          </Form.Item>
        )}
      />

      {guilds.length ? null : (
        <Alert variant="warning">
          <IconAlertTriangle className="size-4" />
          <Alert.Title>This bot isn't in any server</Alert.Title>
          <Alert.Description>
            Add it with the link below, then refresh.
          </Alert.Description>
        </Alert>
      )}

      {tokenCheck ? <BotInviteLink inviteUrl={tokenCheck.inviteUrl} /> : null}

      <div className="rounded-lg border border-border p-3 text-sm">
        <p className="font-medium">What the bot gets</p>
        <ul className="mt-2 space-y-1 text-muted-foreground">
          {DISCORD_BOT_PERMISSIONS.map((permission) => (
            <li key={permission} className="flex items-center gap-2">
              <span className="text-success">✓</span>
              {permission}
            </li>
          ))}
          <li className="flex items-center gap-2">
            <span>✗</span>
            No access to message content
          </li>
        </ul>
      </div>
    </div>
  );
}

export function ConnectDiscordSheet({
  open,
  onOpenChange,
  connection,
  onConnected,
}: Readonly<ConnectDiscordSheetProps>) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [checkedToken, setCheckedToken] = useState('');
  const form = useForm<TDiscordConnectForm>({
    resolver: zodResolver(DISCORD_CONNECT_SCHEMA),
    defaultValues: EMPTY_FORM,
  });
  const { checkToken, result, checking, error } = useDiscordTokenCheck();
  const token = form.watch('token');
  const isCurrentToken = Boolean(checkedToken) && checkedToken === token.trim();
  const tokenCheck = isCurrentToken ? result : undefined;
  const checkError = isCurrentToken ? error?.message : undefined;

  const { connectDiscord, connecting } = useConnectDiscord({
    onCompleted: ({ operationDiscordConnect: connected }) => {
      toast({
        title: connection ? 'Bot token updated' : 'Discord server connected',
        description: describeCommands(connected),
      });
      onOpenChange(false);
      onConnected?.();
    },
    onError: (connectError) =>
      form.setError('root', { message: connectError.message }),
  });

  useEffect(() => {
    if (open) {
      form.reset(EMPTY_FORM);
      setStep(1);
      setCheckedToken('');
    }
  }, [form, open]);

  useEffect(() => {
    if (!tokenCheck || form.getValues('guildId')) {
      return;
    }

    const preferred = tokenCheck.guilds.find(
      (guild) => guild.id === connection?.guildId,
    );

    if (preferred) {
      form.setValue('guildId', preferred.id);
    }
  }, [connection, form, tokenCheck]);

  function verifyToken() {
    const value = form.getValues('token').trim();

    if (!value || (value === checkedToken && !error)) {
      return;
    }

    form.clearErrors('root');
    form.setValue('guildId', '');
    setCheckedToken(value);
    void checkToken({ variables: { token: value } });
  }

  function refreshServers() {
    form.clearErrors('root');
    void checkToken({ variables: { token: checkedToken } });
  }

  function handleSubmit(values: TDiscordConnectForm) {
    connectDiscord({
      variables: { token: values.token.trim(), guildId: values.guildId },
    });
  }

  const rootError = form.formState.errors.root?.message;

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
                {connection ? 'Update bot token' : 'Add Discord bot'}
              </Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>

            <Sheet.Content className="flex flex-col overflow-hidden">
              <IntegrationSteps step={step} steps={CONNECT_STEPS} />
              <div className="flex flex-1 flex-col gap-4 overflow-auto p-4 pt-0">
                {rootError ? (
                  <Alert variant="destructive">
                    <Alert.Description>{rootError}</Alert.Description>
                  </Alert>
                ) : null}

                {step === 1 ? (
                  <TokenStep
                    form={form}
                    checking={checking}
                    tokenCheck={tokenCheck}
                    checkError={checkError}
                    onVerify={verifyToken}
                  />
                ) : (
                  <ServerStep
                    form={form}
                    tokenCheck={tokenCheck}
                    checking={checking}
                    onRefresh={refreshServers}
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
                  disabled={!tokenCheck || checking}
                  onClick={() => setStep(2)}
                >
                  Next step
                </Button>
              ) : (
                <Button type="submit" disabled={!tokenCheck || connecting}>
                  {connecting ? <Spinner size="sm" /> : 'Connect'}
                </Button>
              )}
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
}

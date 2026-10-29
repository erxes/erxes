import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconExternalLink } from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Badge,
  Button,
  Dialog,
  Form,
  Input,
  Select,
  Spinner,
  useToast,
} from 'erxes-ui';
import { DISCORD_DEVELOPER_PORTAL_URL } from '../constants';
import {
  useConnectDiscord,
  useDiscordTokenCheck,
} from '../hooks/useDiscordIntegration';
import { DISCORD_CONNECT_SCHEMA, TDiscordConnectForm } from '../schemas';
import { ConnectDiscordDialogProps } from '../types';

const EMPTY_FORM: TDiscordConnectForm = { token: '', guildId: '' };

export function ConnectDiscordDialog({
  open,
  onClose,
  onConnected,
}: ConnectDiscordDialogProps) {
  const { toast } = useToast();
  const [checkedToken, setCheckedToken] = useState('');
  const form = useForm<TDiscordConnectForm>({
    resolver: zodResolver(DISCORD_CONNECT_SCHEMA),
    defaultValues: EMPTY_FORM,
  });
  const { checkToken, result, checking, error } = useDiscordTokenCheck();
  const token = form.watch('token');
  const tokenCheck =
    result && checkedToken && checkedToken === token.trim()
      ? result
      : undefined;

  const { connectDiscord, connecting } = useConnectDiscord({
    onCompleted: () => {
      toast({ title: 'Discord server connected' });
      onClose();
      onConnected?.();
    },
    onError: (connectError) =>
      form.setError('root', { message: connectError.message }),
  });

  useEffect(() => {
    if (open) {
      form.reset(EMPTY_FORM);
      setCheckedToken('');
    }
  }, [form, open]);

  async function handleCheck() {
    if (!(await form.trigger('token'))) {
      return;
    }

    const value = form.getValues('token').trim();

    form.clearErrors('root');
    form.setValue('guildId', '');
    setCheckedToken(value);
    void checkToken({ variables: { token: value } });
  }

  function handleSubmit(values: TDiscordConnectForm) {
    connectDiscord({
      variables: { token: values.token.trim(), guildId: values.guildId },
    });
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Content className="max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Dialog.Header>
              <Dialog.Title>Connect a Discord server</Dialog.Title>
              <Dialog.Description>
                erxes posts triage and task updates through your own Discord
                bot.
              </Dialog.Description>
            </Dialog.Header>

            <div className="space-y-4 py-4">
              <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                <li>
                  Create an application in the{' '}
                  <a
                    href={DISCORD_DEVELOPER_PORTAL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Discord Developer Portal
                  </a>{' '}
                  and copy its bot token.
                </li>
                <li>Paste the token below and check it.</li>
                <li>Add the bot to your server, then choose the server.</li>
              </ol>

              {form.formState.errors.root?.message ? (
                <Alert variant="destructive">
                  {form.formState.errors.root.message}
                </Alert>
              ) : null}

              <Form.Field
                control={form.control}
                name="token"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Bot token</Form.Label>
                    <div className="flex gap-2">
                      <Form.Control>
                        <Input
                          {...field}
                          type="password"
                          autoComplete="off"
                          placeholder="Paste the bot token"
                        />
                      </Form.Control>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleCheck}
                        disabled={checking}
                      >
                        {checking ? <Spinner size="sm" /> : 'Check'}
                      </Button>
                    </div>
                    <Form.Description>
                      The token is stored on the server and never shown again.
                    </Form.Description>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              {error && checkedToken === token.trim() ? (
                <Alert variant="destructive">{error.message}</Alert>
              ) : null}

              {tokenCheck ? (
                <>
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm">
                    <span>
                      Connected as{' '}
                      <span className="font-semibold">
                        {tokenCheck.botUsername}
                      </span>
                    </span>
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={tokenCheck.inviteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Add bot to a server
                        <IconExternalLink className="size-4" />
                      </a>
                    </Button>
                  </div>

                  <Form.Field
                    control={form.control}
                    name="guildId"
                    render={({ field }) => (
                      <Form.Item>
                        <div className="flex items-center justify-between">
                          <Form.Label>Discord server</Form.Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleCheck}
                            disabled={checking}
                          >
                            Refresh servers
                          </Button>
                        </div>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={!tokenCheck.guilds.length}
                        >
                          <Form.Control>
                            <Select.Trigger className="border">
                              <Select.Value placeholder="Choose a server…" />
                            </Select.Trigger>
                          </Form.Control>
                          <Select.Content>
                            {tokenCheck.guilds.map((guild) => (
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
                        {tokenCheck.guilds.length ? (
                          <Form.Description>
                            Choosing a connected server updates its bot token.
                          </Form.Description>
                        ) : (
                          <Form.Description>
                            The bot is not in any server yet. Add it with the
                            link above, then refresh.
                          </Form.Description>
                        )}
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </>
              ) : null}
            </div>

            <Dialog.Footer>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!tokenCheck || connecting}>
                {connecting ? <Spinner size="sm" /> : 'Connect server'}
              </Button>
            </Dialog.Footer>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
}

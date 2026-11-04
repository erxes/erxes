import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconCopy, IconExternalLink } from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Button,
  CopyText,
  Form,
  Input,
  Label,
  Select,
  Sheet,
  Spinner,
  useToast,
} from 'erxes-ui';
import { IntegrationSteps } from '@/integrations/components/IntegrationSteps';
import { DISCORD_DEVELOPER_PORTAL_URL } from '../constants';
import {
  useDiscordOAuthRedirectUri,
  useSetDiscordClientSecret,
} from '../hooks/useDiscordAccount';
import {
  DISCORD_CLIENT_SECRET_SCHEMA,
  TDiscordClientSecretForm,
} from '../schemas';
import { IDiscordConnection } from '../types';

const LINKING_STEPS = [
  {
    title: 'Add redirect URL',
    description: 'Tell Discord where to send members back after they sign in.',
  },
  {
    title: 'Paste client secret',
    description: 'Let erxes confirm who each member is on Discord.',
  },
] as const;

const getOAuthSettingsUrl = (applicationId: string) =>
  `${DISCORD_DEVELOPER_PORTAL_URL}/${applicationId}/oauth2`;

function OpenDiscordSettings({
  applicationId,
}: Readonly<{ applicationId: string }>) {
  return (
    <Button type="button" variant="secondary" className="w-fit" asChild>
      <a
        href={getOAuthSettingsUrl(applicationId)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <IconExternalLink />
        Open Discord OAuth2 settings
      </a>
    </Button>
  );
}

function RedirectUri({ skip }: Readonly<{ skip: boolean }>) {
  const { redirectUri, loading, error } = useDiscordOAuthRedirectUri(skip);

  if (loading) {
    return <Spinner size="sm" containerClassName="h-auto justify-start" />;
  }

  if (error) {
    return <span className="text-destructive">{error.message}</span>;
  }

  return (
    <CopyText
      value={redirectUri}
      className="max-w-full rounded border border-border bg-background px-2 py-1.5 font-mono text-xs text-foreground"
    >
      <span className="truncate">{redirectUri}</span>
      <IconCopy className="size-3.5 shrink-0" />
    </CopyText>
  );
}

export function DiscordMemberLinkingSheet({
  open,
  onOpenChange,
  connections,
  defaultConnectionId = '',
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connections: IDiscordConnection[];
  defaultConnectionId?: string;
}>) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [connectionId, setConnectionId] = useState('');
  const connection =
    connections.find((item) => item._id === connectionId) ?? connections[0];
  const form = useForm<TDiscordClientSecretForm>({
    resolver: zodResolver(DISCORD_CLIENT_SECRET_SCHEMA),
    defaultValues: { clientSecret: '' },
  });

  const { setClientSecret, saving } = useSetDiscordClientSecret({
    onCompleted: () => {
      toast({
        title: 'Member linking turned on',
        description:
          'Members can now link their Discord account in My account.',
      });
      onOpenChange(false);
    },
    onError: (error) => form.setError('root', { message: error.message }),
  });

  useEffect(() => {
    if (open) {
      form.reset({ clientSecret: '' });
      setStep(1);
      setConnectionId(defaultConnectionId);
    }
  }, [defaultConnectionId, form, open]);

  function handleSubmit(values: TDiscordClientSecretForm) {
    if (!connection) {
      return;
    }

    setClientSecret({
      variables: {
        _id: connection._id,
        clientSecret: values.clientSecret.trim(),
      },
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
              <Sheet.Title>Set up member linking</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>

            <Sheet.Content className="flex flex-col overflow-hidden">
              <IntegrationSteps step={step} steps={LINKING_STEPS} />
              <div className="flex flex-1 flex-col gap-4 overflow-auto p-4 pt-0">
                {rootError ? (
                  <Alert variant="destructive">
                    <Alert.Description>{rootError}</Alert.Description>
                  </Alert>
                ) : null}

                {step === 1 ? (
                  <div className="flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground">
                      Set this up once for the whole workspace. Members link
                      their Discord account in My account, and the bot mentions
                      them in every connected server they are in.
                    </p>

                    {connections.length > 1 ? (
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="discord-linking-bot">Bot</Label>
                        <Select
                          value={connection?._id ?? ''}
                          onValueChange={setConnectionId}
                        >
                          <Select.Trigger id="discord-linking-bot">
                            <Select.Value placeholder="Select a bot" />
                          </Select.Trigger>
                          <Select.Content>
                            {connections.map((item) => (
                              <Select.Item key={item._id} value={item._id}>
                                {item.botUsername} · {item.guildName}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Members sign in through this bot’s Discord
                          application.
                        </p>
                      </div>
                    ) : null}

                    <ol className="list-decimal space-y-3 pl-5 text-sm">
                      <li>
                        Open the OAuth2 settings of{' '}
                        <span className="font-medium">
                          {connection?.botUsername}
                        </span>
                        .
                        {connection ? (
                          <div className="mt-2">
                            <OpenDiscordSettings
                              applicationId={connection.applicationId}
                            />
                          </div>
                        ) : null}
                      </li>
                      <li>
                        Under <span className="font-medium">Redirects</span>,
                        click <span className="font-medium">Add Redirect</span>,
                        paste this URL and click{' '}
                        <span className="font-medium">Save Changes</span>:
                        <div className="mt-2">
                          <RedirectUri skip={!open} />
                        </div>
                      </li>
                    </ol>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <ol className="list-decimal space-y-3 pl-5 text-sm">
                      <li>
                        On the same OAuth2 page, under{' '}
                        <span className="font-medium">Client Secret</span>,
                        click <span className="font-medium">Reset Secret</span>{' '}
                        and copy the new secret.
                        {connection ? (
                          <div className="mt-2">
                            <OpenDiscordSettings
                              applicationId={connection.applicationId}
                            />
                          </div>
                        ) : null}
                      </li>
                      <li>Paste it below and turn linking on.</li>
                    </ol>

                    <Form.Field
                      control={form.control}
                      name="clientSecret"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>Client secret</Form.Label>
                          <Form.Control>
                            <Input
                              {...field}
                              type="password"
                              autoComplete="off"
                              placeholder="Paste the client secret"
                            />
                          </Form.Control>
                          <Form.Description>
                            erxes checks it with Discord right away. It is
                            stored encrypted and never shown again.
                          </Form.Description>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />

                    <Alert variant="warning">
                      <Alert.Description>
                        Reset Secret replaces the old secret, so anything else
                        that uses it stops working. Use a bot made only for
                        erxes.
                      </Alert.Description>
                    </Alert>
                  </div>
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
                  disabled={!connection}
                  onClick={() => setStep(2)}
                >
                  Next step
                </Button>
              ) : (
                <Button type="submit" disabled={saving || !connection}>
                  {saving ? <Spinner size="sm" /> : 'Turn on'}
                </Button>
              )}
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
}

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconCopy } from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import {
  Badge,
  Button,
  CopyText,
  Form,
  Input,
  Spinner,
  useConfirm,
  useToast,
} from 'erxes-ui';
import {
  useClearDiscordClientSecret,
  useDiscordOAuthRedirectUri,
  useSetDiscordClientSecret,
} from '../hooks/useDiscordAccount';
import {
  DISCORD_CLIENT_SECRET_SCHEMA,
  TDiscordClientSecretForm,
} from '../schemas';
import { IDiscordConnection } from '../types';

export function DiscordMemberLinking({
  connection,
}: {
  connection: IDiscordConnection;
}) {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [expanded, setExpanded] = useState(false);
  const form = useForm<TDiscordClientSecretForm>({
    resolver: zodResolver(DISCORD_CLIENT_SECRET_SCHEMA),
    defaultValues: { clientSecret: '' },
  });
  const {
    redirectUri,
    loading: redirectLoading,
    error: redirectError,
  } = useDiscordOAuthRedirectUri(!expanded);

  const { setClientSecret, saving } = useSetDiscordClientSecret({
    onCompleted: () => {
      toast({ title: 'Member linking turned on' });
      form.reset();
      setExpanded(false);
    },
    onError: (error) =>
      form.setError('clientSecret', { message: error.message }),
  });

  const { clearClientSecret, clearing } = useClearDiscordClientSecret({
    onCompleted: () => toast({ title: 'Member linking turned off' }),
    onError: (error) =>
      toast({
        title: 'Could not turn off member linking',
        description: error.message,
        variant: 'destructive',
      }),
  });

  function handleTurnOff() {
    confirm({
      message:
        'Turn off member linking? Linked accounts keep getting mentions, but nobody can link a new account until it is turned on again.',
    }).then(() => {
      clearClientSecret({ variables: { _id: connection._id } });
    });
  }

  function handleSubmit(values: TDiscordClientSecretForm) {
    setClientSecret({
      variables: {
        _id: connection._id,
        clientSecret: values.clientSecret.trim(),
      },
    });
  }

  if (connection.hasClientSecret) {
    return (
      <div className="flex items-center justify-between gap-4 border-t border-border pt-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Member linking</span>
          <Badge variant="success">On</Badge>
          <span>Members link their account in My Discord account.</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleTurnOff}
          disabled={clearing}
        >
          {clearing ? <Spinner size="sm" /> : 'Turn off'}
        </Button>
      </div>
    );
  }

  if (!expanded) {
    return (
      <div className="flex items-center justify-between gap-4 border-t border-border pt-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Member linking</span>
          <Badge variant="secondary">Off</Badge>
          <span>Lets the bot mention task assignees.</span>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setExpanded(true)}>
          Set up
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-3 border-t border-border pt-3"
      >
        <p className="text-sm font-medium">Set up member linking</p>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            In the Discord Developer Portal, open this bot’s application, go to
            OAuth2 → Redirects and add this URL:
            <div className="mt-1">
              {redirectLoading ? (
                <Spinner size="sm" containerClassName="h-auto justify-start" />
              ) : redirectError ? (
                <span className="text-destructive">
                  {redirectError.message}
                </span>
              ) : (
                <CopyText
                  value={redirectUri}
                  className="max-w-full rounded bg-accent px-2 py-1 font-mono text-xs text-foreground"
                >
                  <span className="truncate">{redirectUri}</span>
                  <IconCopy className="size-3.5 shrink-0" />
                </CopyText>
              )}
            </div>
          </li>
          <li>Copy the Client Secret from the same page and paste it below.</li>
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
                Stored on the server and never shown again.
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setExpanded(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? <Spinner size="sm" /> : 'Turn on'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

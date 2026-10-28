import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Badge,
  Button,
  Empty,
  Form,
  Input,
  Sheet,
  Skeleton,
  toast,
} from 'erxes-ui';
import { IconCopy } from '@tabler/icons-react';
import { extensionsApi, webhookUrl } from '../extensionsApi';
import { useExtensionsQuery } from '../hooks/useExtensionsQuery';
import { Extension, ExtensionSecret } from '../types';

// Same bounds the runtime enforces.
const SecretForm = z.object({
  value: z
    .string()
    .min(1, 'Enter a value')
    .max(8192, 'At most 8192 characters'),
});

type SecretForm = z.infer<typeof SecretForm>;

const failed = (title: string, e: unknown) =>
  toast({
    variant: 'destructive',
    title,
    description: e instanceof Error ? e.message : String(e),
  });

const SecretRow = ({
  extId,
  secret,
  onChanged,
}: Readonly<{
  extId: string;
  secret: ExtensionSecret;
  onChanged: () => Promise<void>;
}>) => {
  const [clearing, setClearing] = useState(false);
  const form = useForm<SecretForm>({
    resolver: zodResolver(SecretForm),
    defaultValues: { value: '' },
  });

  const save = async ({ value }: SecretForm) => {
    try {
      await extensionsApi.setSecret(extId, secret.name, value);
      toast({ variant: 'success', title: `Saved ${secret.name}` });
      form.reset({ value: '' });
      await onChanged();
    } catch (e) {
      failed(`Could not save ${secret.name}`, e);
    }
  };

  const clear = async () => {
    setClearing(true);
    try {
      await extensionsApi.clearSecret(extId, secret.name);
      toast({ variant: 'success', title: `Cleared ${secret.name}` });
      await onChanged();
    } catch (e) {
      failed(`Could not clear ${secret.name}`, e);
    } finally {
      setClearing(false);
    }
  };

  const busy = form.formState.isSubmitting || clearing;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(save)}
        className="space-y-2 border-b pb-4 last:border-b-0"
      >
        <Form.Field
          control={form.control}
          name="value"
          render={({ field }) => (
            <Form.Item>
              <div className="flex items-center gap-2">
                <Form.Label className="font-mono">{secret.name}</Form.Label>
                <Badge variant={secret.set ? 'success' : 'secondary'}>
                  {secret.set ? 'Set' : 'Not set'}
                </Badge>
                {secret.updatedAt && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(secret.updatedAt).toLocaleString()}
                  </span>
                )}
              </div>
              <Form.Description>{secret.description}</Form.Description>
              <Form.Control>
                <Input
                  {...field}
                  type="password"
                  autoComplete="new-password"
                  placeholder={
                    secret.set ? 'Enter a new value to replace it' : 'Value'
                  }
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={busy}>
            {secret.set ? 'Replace' : 'Save'}
          </Button>
          {secret.set && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={clear}
            >
              Clear
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

const SecretsNotice = ({ children }: Readonly<{ children: string }>) => (
  <Empty className="min-h-60">
    <Empty.Header>
      <Empty.Title>{children}</Empty.Title>
    </Empty.Header>
  </Empty>
);

const ExtensionSecrets = ({ extId }: Readonly<{ extId: string }>) => {
  const load = useCallback(() => extensionsApi.secrets(extId), [extId]);
  const { data, error, loading, refetch } = useExtensionsQuery(load);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <SecretsNotice>
        {error?.message ?? 'Could not load secrets'}
      </SecretsNotice>
    );
  }

  if (data.length === 0) {
    return <SecretsNotice>This version declares no secrets</SecretsNotice>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Stored encrypted. Saved values are never shown again; enter a new one to
        replace it.
      </p>
      {data.map((secret) => (
        <SecretRow
          key={secret.name}
          extId={extId}
          secret={secret}
          onChanged={refetch}
        />
      ))}
    </div>
  );
};

const copy = (url: string) =>
  navigator.clipboard.writeText(url).then(
    () => toast({ variant: 'success', title: 'Webhook URL copied' }),
    (e: unknown) => failed('Could not copy the URL', e),
  );

// Each webhook's URL, to paste into the vendor's settings with the secret
// it signs with.
const ExtensionWebhooks = ({ ext }: Readonly<{ ext: Extension }>) => {
  const webhooks = Object.entries(ext.webhooks ?? {});
  const { installKey } = ext;

  if (webhooks.length === 0 || !installKey) {
    return null;
  }

  return (
    <section className="space-y-3 border-t pt-4 mt-4">
      <h4 className="text-sm font-semibold">Webhooks</h4>
      <p className="text-sm text-muted-foreground">
        Give the vendor the URL and the secret it signs with. Reinstalling after
        an uninstall changes the URL.
      </p>
      {webhooks.map(([name, { signature }]) => {
        const url = webhookUrl(installKey, name);
        return (
          <div key={name} className="space-y-1">
            <div className="text-sm">
              <span className="font-mono">{name}</span>
              <span className="text-muted-foreground">
                {' '}
                signed with {signature.secret} in {signature.header}
              </span>
            </div>
            <div className="flex gap-2">
              <Input readOnly value={url} className="font-mono text-xs" />
              <Button
                type="button"
                size="icon"
                variant="secondary"
                aria-label={`Copy the ${name} webhook URL`}
                onClick={() => copy(url)}
              >
                <IconCopy />
              </Button>
            </div>
          </div>
        );
      })}
    </section>
  );
};

export function ExtensionSecretsSheet({
  ext,
  open,
  onClose,
}: Readonly<{ ext: Extension; open: boolean; onClose: () => void }>) {
  const hasWebhooks = Object.keys(ext.webhooks ?? {}).length > 0;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Sheet.View className="sm:max-w-lg flex flex-col gap-0">
        <Sheet.Header>
          <Sheet.Title>
            {ext.extId} {hasWebhooks ? 'secrets and webhooks' : 'secrets'}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="flex-1 min-h-0 overflow-auto p-4">
          {open && (
            <>
              <ExtensionSecrets extId={ext.extId} />
              <ExtensionWebhooks ext={ext} />
            </>
          )}
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
}

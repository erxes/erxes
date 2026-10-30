import { gql, useMutation, useQuery } from '@apollo/client';
import {
  IconAlertCircle,
  IconCheck,
  IconCopy,
  IconPlayerPause,
  IconPlayerPlay,
  IconTrash,
  IconWebhook,
} from '@tabler/icons-react';
import {
  Badge,
  Button,
  Checkbox,
  Input,
  Label,
  Sheet,
  Spinner,
  toast,
  useConfirm,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDataExtensionRecordTypes } from 'ui-modules';

const WEBHOOK_FIELDS = `
  _id
  name
  url
  recordTypes
  active
  hasSecret
  lastStatus
  lastError
  lastAt
`;

const WEBHOOKS = gql`
  query DataExtensionWebhooks {
    dataExtensionWebhooks { ${WEBHOOK_FIELDS} }
  }
`;

const WEBHOOK_ADD = gql`
  mutation DataExtensionWebhookAdd($input: DataExtensionWebhookInput!) {
    dataExtensionWebhookAdd(input: $input) { ${WEBHOOK_FIELDS} secret }
  }
`;

const WEBHOOK_EDIT = gql`
  mutation DataExtensionWebhookEdit($_id: String!, $input: DataExtensionWebhookInput!) {
    dataExtensionWebhookEdit(_id: $_id, input: $input) { ${WEBHOOK_FIELDS} }
  }
`;

const WEBHOOK_DELETE = gql`
  mutation DataExtensionWebhookDelete($_id: String!) {
    dataExtensionWebhookDelete(_id: $_id)
  }
`;

interface IWebhook {
  _id: string;
  name: string;
  url: string;
  recordTypes: string[];
  active: boolean;
  lastStatus?: number | null;
  lastError?: string | null;
  lastAt?: string | null;
}

/**
 * Outgoing webhooks for value changes: list with last delivery, add (the
 * signing secret is shown once), pause and delete.
 */
export const DataExtensionWebhooksSheet = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t, i18n } = useTranslation('dataExtensions');
  const { confirm } = useConfirm();
  const { recordTypes } = useDataExtensionRecordTypes();
  const options = { refetchQueries: ['DataExtensionWebhooks'], awaitRefetchQueries: true };
  const { data, loading } = useQuery<{ dataExtensionWebhooks: IWebhook[] }>(WEBHOOKS, {
    skip: !open,
    fetchPolicy: 'cache-and-network',
  });
  const [add, addState] = useMutation(WEBHOOK_ADD, options);
  const [edit] = useMutation(WEBHOOK_EDIT, options);
  const [remove] = useMutation(WEBHOOK_DELETE, options);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [secret, setSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const webhooks = data?.dataExtensionWebhooks || [];

  const fail = (error: unknown) =>
    toast({
      variant: 'destructive',
      title: t('webhooks.failed'),
      description: error instanceof Error ? error.message : undefined,
    });

  const create = async () => {
    try {
      const result = await add({
        variables: { input: { name: name.trim(), url: url.trim(), recordTypes: selected } },
      });

      setSecret(result.data?.dataExtensionWebhookAdd?.secret || null);
      setCopied(false);
      setName('');
      setUrl('');
      setSelected([]);
    } catch (error) {
      fail(error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View className="p-0 sm:max-w-xl">
        <Sheet.Header>
          <Sheet.Title className="flex items-center gap-2">
            <IconWebhook />
            {t('webhooks.title')}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="flex flex-col gap-5 overflow-y-auto p-5">
          <p className="text-sm text-muted-foreground">{t('webhooks.intro')}</p>

          {secret && (
            <div className="flex flex-col gap-2 rounded-md border border-warning/40 bg-warning/10 p-3" role="status">
              <p className="text-sm font-medium">{t('webhooks.secret-title')}</p>
              <p className="text-xs text-muted-foreground">{t('webhooks.secret-hint')}</p>
              <div className="flex gap-1.5">
                <Input readOnly value={secret} className="font-mono text-xs" aria-label={t('webhooks.secret-title')} />
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={t('webhooks.copy')}
                  onClick={async () => {
                    await navigator.clipboard.writeText(secret);
                    setCopied(true);
                  }}
                >
                  {copied ? <IconCheck /> : <IconCopy />}
                </Button>
              </div>
            </div>
          )}

          <form
            className="flex flex-col gap-3 rounded-md border p-3"
            onSubmit={(event) => {
              event.preventDefault();
              create();
            }}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_2fr]">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="data-extensions-webhook-name">{t('webhooks.name')}</Label>
                <Input
                  id="data-extensions-webhook-name"
                  value={name}
                  maxLength={80}
                  placeholder={t('webhooks.name-placeholder')}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="data-extensions-webhook-url">{t('webhooks.url')}</Label>
                <Input
                  id="data-extensions-webhook-url"
                  type="url"
                  value={url}
                  placeholder="https://"
                  onChange={(event) => setUrl(event.target.value)}
                />
              </div>
            </div>
            <fieldset className="flex flex-col gap-1.5">
              <legend className="mb-1 text-xs font-medium">{t('webhooks.record-types')}</legend>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {recordTypes.map((recordType) => (
                  <div key={recordType.recordType} className="flex items-center gap-1.5">
                    <Checkbox
                      id={`webhook-${recordType.recordType}`}
                      checked={selected.includes(recordType.recordType)}
                      onCheckedChange={(checked) =>
                        setSelected((current) =>
                          checked
                            ? [...current, recordType.recordType]
                            : current.filter((value) => value !== recordType.recordType),
                        )
                      }
                    />
                    <Label
                      htmlFor={`webhook-${recordType.recordType}`}
                      className="text-xs font-normal normal-case tracking-normal"
                    >
                      {t(`record-types.${recordType.recordType}`, recordType.label)}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{t('webhooks.record-types-hint')}</p>
            </fieldset>
            <Button
              type="submit"
              className="self-start"
              disabled={!name.trim() || !url.trim() || addState.loading}
            >
              {addState.loading && <Spinner size="sm" />}
              {t('webhooks.add')}
            </Button>
          </form>

          {loading && !webhooks.length ? (
            <Spinner />
          ) : !webhooks.length ? (
            <p className="text-sm text-muted-foreground">{t('webhooks.none')}</p>
          ) : (
            <ul className="flex flex-col divide-y rounded-md border">
              {webhooks.map((hook) => (
                <li key={hook._id} className="flex items-start gap-3 p-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{hook.name}</span>
                      {!hook.active && <Badge variant="secondary">{t('webhooks.paused')}</Badge>}
                    </div>
                    <span className="truncate font-mono text-xs text-muted-foreground">{hook.url}</span>
                    {hook.lastAt && (
                      <span
                        className={`flex items-center gap-1 text-xs ${hook.lastError ? 'text-destructive' : 'text-muted-foreground'}`}
                      >
                        {hook.lastError ? (
                          <IconAlertCircle className="size-3.5" aria-hidden="true" />
                        ) : (
                          <IconCheck className="size-3.5 text-success" aria-hidden="true" />
                        )}
                        {hook.lastError
                          ? t('webhooks.last-failed', { error: hook.lastError })
                          : t('webhooks.last-ok', { status: hook.lastStatus })}
                        {' · '}
                        {new Date(hook.lastAt).toLocaleString(i18n.language)}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={hook.active ? t('webhooks.pause') : t('webhooks.resume')}
                    title={hook.active ? t('webhooks.pause') : t('webhooks.resume')}
                    onClick={() =>
                      edit({ variables: { _id: hook._id, input: { active: !hook.active } } }).catch(fail)
                    }
                  >
                    {hook.active ? <IconPlayerPause /> : <IconPlayerPlay />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    aria-label={t('webhooks.delete', { name: hook.name })}
                    onClick={() =>
                      confirm({
                        message: t('webhooks.delete-confirm', { name: hook.name }),
                        options: { okLabel: t('delete'), variants: { ok: 'destructive' } },
                      }).then(() => remove({ variables: { _id: hook._id } }).catch(fail))
                    }
                  >
                    <IconTrash />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};

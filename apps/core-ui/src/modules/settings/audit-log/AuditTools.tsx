import { CORE_API_PREFIX } from '@erxes/core-contract';
import { IconDownload, IconShieldCheck, IconShieldX } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Input, Popover, Spinner, useToast } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf, orpc } from '~/lib/api';

const JWKS = `${CORE_API_PREFIX}/.well-known/jwks.json`;
const PAGE = 1000;

type Checkpoint = Awaited<ReturnType<typeof orpc.audit.checkpoints.call>>['data'][number];

/**
 * Every signed checkpoint as JSON, to keep outside erxes: with the public keys
 * anyone can later prove what the log held.
 */
const downloadCheckpoints = async () => {
  const all: Checkpoint[] = [];
  let after: number | undefined;

  for (;;) {
    const { data } = await orpc.audit.checkpoints.call({ after, limit: PAGE });

    all.push(...data);
    after = data.at(-1)?.chainSeq;

    if (data.length < PAGE || after === undefined) break;
  }

  const blob = new Blob([JSON.stringify({ jwks: JWKS, checkpoints: all }, null, 2)], {
    type: 'application/json',
  });

  const link = document.createElement('a');

  link.href = URL.createObjectURL(blob);
  link.download = `audit-checkpoints-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
};

const DownloadCheckpoints = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'audit-log' });
  const { toast } = useToast();

  const download = useMutation({
    mutationFn: downloadCheckpoints,
    onError: (error) =>
      toast({
        variant: 'destructive',
        title: t('download-failed', 'Could not download the checkpoints'),
        description: messageOf(error),
      }),
  });

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={download.isPending}
      onClick={() => download.mutate()}
    >
      {download.isPending ? <Spinner size="sm" /> : <IconDownload />}
      {t('download-checkpoints', 'Download signed checkpoints')}
    </Button>
  );
};

type Verdict = Awaited<ReturnType<typeof orpc.audit.verify.call>>;

const VerifyResult = ({ result }: { result: Verdict }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'audit-log' });

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        {result.ok ? (
          <IconShieldCheck className="size-5 shrink-0 text-green-600" />
        ) : (
          <IconShieldX className="size-5 shrink-0 text-destructive" />
        )}
        <p>
          {result.ok
            ? t('verify-ok', {
                count: result.checked,
                defaultValue: `All ${result.checked} entries are intact: none was changed or removed.`,
              })
            : result.brokenAt !== null
              ? t('verify-broken', {
                  position: result.brokenAt,
                  defaultValue: `The chain breaks at entry #${result.brokenAt}: an entry was changed or removed outside erxes.`,
                })
              : t('verify-checkpoint-mismatch', {
                  position: result.checkpoints.mismatchAt,
                  defaultValue: `The log no longer matches signed checkpoint #${result.checkpoints.mismatchAt}: entries were rewritten or removed outside erxes.`,
                })}
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        {result.checkpoints.latestAt
          ? t('verify-checkpoints', {
              count: result.checkpoints.checked,
              defaultValue: `${result.checkpoints.checked} signed checkpoints checked. erxes signs the chain every 10 minutes with a key kept outside the database.`,
            })
          : t(
              'verify-no-checkpoints',
              'No signed checkpoint yet: erxes signs the chain every 10 minutes.',
            )}
      </p>
      <DownloadCheckpoints />
    </div>
  );
};

/** Re-checks the hash chain and the signed checkpoints: has any entry been changed or removed? */
export const IntegrityCheck = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'audit-log' });
  const verify = useMutation(orpc.audit.verify.mutationOptions());

  return (
    <Popover onOpenChange={(open) => open && verify.mutate(undefined)}>
      <Popover.Trigger asChild>
        <Button variant="ghost">
          <IconShieldCheck />
          {t('verify', 'Check integrity')}
        </Button>
      </Popover.Trigger>
      <Popover.Content align="end" className="w-80 text-sm">
        {verify.isError ? (
          <p role="alert" className="text-destructive">
            {messageOf(verify.error)}
          </p>
        ) : verify.data ? (
          <VerifyResult result={verify.data} />
        ) : (
          <Spinner containerClassName="py-4" />
        )}
      </Popover.Content>
    </Popover>
  );
};

const auditSettingsQuery = () => orpc.audit.settings.queryOptions();

/** Mounted when the popover opens, so it starts from the saved value. */
const RetentionForm = ({ saved, max }: { saved: number; max: number }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'audit-log' });
  const client = useQueryClient();
  const { toast } = useToast();
  const id = useId();
  const [days, setDays] = useState(String(saved));

  const save = useMutation(
    orpc.audit.updateSettings.mutationOptions({
      onSuccess: (next) => {
        client.setQueryData(auditSettingsQuery().queryKey, next);
        toast({ title: t('retention-saved', 'Retention saved') });
      },
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('retention-failed', 'Could not save'),
          description: messageOf(error),
        }),
    }),
  );

  return (
    <div className="flex items-center gap-2">
      <Input
        id={id}
        type="number"
        min={30}
        max={max}
        value={days}
        onChange={(event) => setDays(event.target.value)}
        className="w-24"
      />
      <label htmlFor={id} className="text-muted-foreground">
        {t('days', 'days')}
      </label>
      <Button
        size="sm"
        className="ml-auto"
        disabled={save.isPending || Number(days) < 30 || Number(days) > max}
        onClick={() => save.mutate({ retentionDays: Number(days) })}
      >
        {t('save', 'Save')}
      </Button>
    </div>
  );
};

/** How long entries are kept (owners). */
export const Retention = ({ isOwner }: { isOwner: boolean }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'audit-log' });
  const settings = useQuery(auditSettingsQuery());

  if (settings.isError)
    return (
      <Button
        variant="ghost"
        className="text-destructive"
        title={messageOf(settings.error)}
        onClick={() => void settings.refetch()}
      >
        {t('retention-unavailable', 'Retention unknown: retry')}
      </Button>
    );

  if (!settings.data) return null;

  const { retentionDays, maxRetentionDays } = settings.data;

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="ghost" className="text-muted-foreground">
          {t('kept-for', { days: retentionDays, defaultValue: `Kept ${retentionDays} days` })}
        </Button>
      </Popover.Trigger>
      <Popover.Content align="end" className="w-72 space-y-3 text-sm">
        <p>
          {t('retention-description', {
            max: maxRetentionDays,
            defaultValue: `Older entries are deleted automatically. This server keeps them up to ${maxRetentionDays} days.`,
          })}
        </p>
        {isOwner ? (
          <RetentionForm saved={retentionDays} max={maxRetentionDays} />
        ) : (
          <p className="text-muted-foreground">{t('owner-only', 'Only owners can change this.')}</p>
        )}
      </Popover.Content>
    </Popover>
  );
};

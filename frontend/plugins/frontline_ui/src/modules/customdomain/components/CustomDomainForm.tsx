import { IconRefresh, IconWorldWww } from '@tabler/icons-react';
import { Button, Input, Label, Spinner, useConfirm } from 'erxes-ui';
import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomDomainStatusBadge } from '@/customdomain/components/CustomDomainStatusBadge';
import { useCustomDomainActions } from '@/customdomain/hooks/useCustomDomain';
import { ICustomDomain } from '@/customdomain/types';

export const CustomDomainForm = ({ domain }: { domain: ICustomDomain }) => {
  const { t } = useTranslation('frontline');
  const { confirm } = useConfirm();
  const [hostname, setHostname] = useState('');
  const {
    saveDomain,
    refreshDomain,
    resetDomain,
    saving,
    refreshing,
    resetting,
  } = useCustomDomainActions();

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (hostname.trim()) {
      saveDomain(hostname.trim());
    }
  };

  const onReset = async () => {
    try {
      await confirm({
        message: t(
          'customdomain-reset-confirm',
          'Disconnect {{hostname}}? Visitors to it will stop seeing your help center.',
          { hostname: domain.hostname },
        ),
      });
    } catch {
      return;
    }

    resetDomain();
  };

  if (!domain.hostname) {
    return (
      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <Label htmlFor="custom-domain-hostname">
          {t('customdomain-label', 'Custom domain')}
        </Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="custom-domain-hostname"
            value={hostname}
            onChange={(event) => setHostname(event.target.value)}
            placeholder="help.yourcompany.com"
            autoComplete="off"
            spellCheck={false}
            className="sm:max-w-sm"
          />
          <Button type="submit" disabled={saving || !hostname.trim()}>
            {saving && <Spinner size="sm" />}
            {t('save', 'Save')}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {t(
            'customdomain-hint',
            'Use a subdomain such as help.yourcompany.com. Root domains need a DNS provider that supports CNAME flattening.',
          )}
        </p>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <IconWorldWww className="size-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <a
            href={`https://${domain.hostname}`}
            target="_blank"
            rel="noreferrer"
            className="block truncate font-medium hover:underline"
          >
            {domain.hostname}
          </a>
          <p className="text-sm text-muted-foreground">
            {domain.isActive
              ? t(
                  'customdomain-live',
                  'Your help center is live on this domain.',
                )
              : t(
                  'customdomain-waiting',
                  'Waiting for DNS and the certificate to be verified.',
                )}
          </p>
        </div>
        <CustomDomainStatusBadge
          status={domain.isActive ? 'active' : 'pending'}
        />
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => refreshDomain()}
          disabled={refreshing || resetting}
        >
          {refreshing ? <Spinner size="sm" /> : <IconRefresh />}
          {t('customdomain-refresh', 'Refresh')}
        </Button>
        <Button
          variant="destructive"
          onClick={onReset}
          disabled={refreshing || resetting}
        >
          {resetting && <Spinner size="sm" />}
          {t('customdomain-reset', 'Reset Domain')}
        </Button>
      </div>
    </div>
  );
};

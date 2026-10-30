import { IconShieldCheck } from '@tabler/icons-react';
import { Badge, Button, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { RecoveryCodes } from '@/auth/two-factor/components/RecoveryCodes';
import { TwoFactorCodeForm } from '@/auth/two-factor/components/TwoFactorCodeForm';
import { TwoFactorQr } from '@/auth/two-factor/components/TwoFactorQr';
import { useTwoFactorAccount } from '@/settings/two-factor/hooks/useTwoFactorAccount';

/** The signed-in member's own 2FA: turn on, new recovery codes, turn off. */
export const TwoFactorAccount = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'two-factor' });
  const { status, loading, error, step, setStep, startSetup, submitCode, busy } =
    useTwoFactorAccount();

  if (loading) return <Spinner />;

  if (error || !status) {
    return <p className="text-sm text-destructive">{error?.message}</p>;
  }

  const back = () => setStep({ kind: 'idle' });

  if (step.kind === 'codes') {
    return (
      <RecoveryCodes codes={step.codes} onDone={back} doneLabel={t('done')} />
    );
  }

  if (step.kind !== 'idle') {
    return (
      <div className="flex flex-col gap-6">
        {step.kind === 'setup' && <TwoFactorQr {...step.qr} />}
        <p className="text-sm text-muted-foreground">
          {t(`${step.kind}-code-prompt`)}
        </p>
        <TwoFactorCodeForm
          onSubmit={submitCode}
          loading={busy}
          submitLabel={t(`${step.kind}-submit`)}
          allowRecovery={step.kind !== 'setup'}
        />
        <Button type="button" variant="ghost" onClick={back}>
          {t('cancel')}
        </Button>
      </div>
    );
  }

  if (!status.enabled) {
    return (
      <div className="flex flex-col gap-4 rounded-lg border p-6">
        <div className="flex items-center gap-2">
          <IconShieldCheck className="text-muted-foreground" />
          <span className="font-medium">{t('off')}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {status.available ? t('off-description') : t('unavailable')}
        </p>
        {status.available && (
          <Button className="self-start" disabled={busy} onClick={startSetup}>
            {busy && <Spinner size="sm" />}
            {t('turn-on')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-6">
      <div className="flex flex-wrap items-center gap-2">
        <IconShieldCheck className="text-success" />
        <span className="font-medium">{t('on')}</span>
        {status.required && (
          <Badge variant="secondary">{t('required-by-organization')}</Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {t('recovery-codes-left', { count: status.recoveryCodesLeft })}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => setStep({ kind: 'regenerate' })}
        >
          {t('new-recovery-codes')}
        </Button>
        {!status.required && (
          <Button
            variant="destructive"
            onClick={() => setStep({ kind: 'disable' })}
          >
            {t('turn-off')}
          </Button>
        )}
      </div>
    </div>
  );
};

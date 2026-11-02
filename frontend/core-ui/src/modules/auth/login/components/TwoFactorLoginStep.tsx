import { Button, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { RecoveryCodes } from '@/auth/two-factor/components/RecoveryCodes';
import { TwoFactorCodeForm } from '@/auth/two-factor/components/TwoFactorCodeForm';
import { TwoFactorQr } from '@/auth/two-factor/components/TwoFactorQr';
import { useTwoFactorLoginStep } from '@/auth/two-factor/hooks/useTwoFactorLoginStep';
import { ITwoFactorChallenge } from '@/auth/two-factor/types';

export const TwoFactorLoginStep = ({
  challenge,
  setup,
  onSignedIn,
  onBack,
}: ITwoFactorChallenge & { onSignedIn: () => void; onBack: () => void }) => {
  const { t } = useTranslation('common', { keyPrefix: 'two-factor' });
  const { qr, settingUp, verifying, recoveryCodes, submitCode } =
    useTwoFactorLoginStep({
      challenge,
      setup,
      onSignedIn,
      onExpired: onBack,
    });

  if (recoveryCodes.length) {
    return (
      <RecoveryCodes
        codes={recoveryCodes}
        onDone={onSignedIn}
        doneLabel={t('continue')}
      />
    );
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-1 text-center">
        <h3 className="font-semibold">
          {setup ? t('setup-title') : t('verify-title')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {setup ? t('setup-description') : t('verify-description')}
        </p>
      </div>
      {setup && (qr ? <TwoFactorQr {...qr} /> : settingUp && <Spinner />)}
      {(!setup || qr) && (
        <TwoFactorCodeForm
          onSubmit={submitCode}
          loading={verifying}
          submitLabel={setup ? t('turn-on-and-sign-in') : t('verify')}
          allowRecovery={!setup}
        />
      )}
      <Button type="button" variant="ghost" onClick={onBack}>
        {t('back-to-sign-in')}
      </Button>
    </div>
  );
};

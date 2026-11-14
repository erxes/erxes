import { useMutation } from '@tanstack/react-query';
import { Button, Input, Label, Spinner } from 'erxes-ui';
import { type SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf, orpc } from '~/lib/api';
import { useSignedIn } from './session';

/** The sign-in's second step: the app's 6-digit code, or a recovery code. */
export const TwoFactorStep = ({ challenge, onBack }: { challenge: string; onBack: () => void }) => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const signedIn = useSignedIn();
  const [recovery, setRecovery] = useState(false);
  const [code, setCode] = useState('');
  const verify = useMutation(orpc.auth.signInTwoFactor.mutationOptions({ onSuccess: signedIn }));

  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    verify.mutate(recovery ? { challenge, recoveryCode: code } : { challenge, code });
  };

  return (
    <form onSubmit={submit} className="mx-auto grid w-full gap-4" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="two-factor-code">
          {recovery
            ? t('recovery-code', 'Recovery code')
            : t('app-code', 'Code from your authenticator app')}
        </Label>
        <Input
          id="two-factor-code"
          value={code}
          inputMode={recovery ? 'text' : 'numeric'}
          autoComplete="one-time-code"
          maxLength={recovery ? 40 : 6}
          placeholder={recovery ? 'xxxxx-xxxxx' : '123456'}
          onChange={(event) =>
            setCode(recovery ? event.target.value : event.target.value.replace(/\D/g, ''))
          }
          text="otp"
        />
      </div>
      {verify.isError && (
        <p role="alert" className="text-sm text-destructive">
          {messageOf(verify.error)}
        </p>
      )}
      <Button
        type="submit"
        className="h-8"
        disabled={verify.isPending || (recovery ? code.length < 8 : code.length !== 6)}
      >
        {verify.isPending ? <Spinner size="sm" /> : t('verify', 'Verify')}
      </Button>
      <div className="flex justify-between text-sm text-muted-foreground">
        <button type="button" className="hover:underline" onClick={onBack}>
          {t('back', 'Back')}
        </button>
        <button
          type="button"
          className="hover:underline"
          onClick={() => {
            setRecovery(!recovery);
            setCode('');
          }}
        >
          {recovery
            ? t('use-app', 'Use the app instead')
            : t('use-recovery', 'Use a recovery code')}
        </button>
      </div>
    </form>
  );
};

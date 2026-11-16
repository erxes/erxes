import { useMutation } from '@tanstack/react-query';
import { Button, Spinner } from 'erxes-ui';
import { type SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { orpc } from '@erxes/core-contract/client';
import { AuthField, AuthForm, ErrorLine } from './components/AuthParts';
import { useSignedIn } from './session';

/** The sign-in's second step: the app's 6-digit code, or a recovery code. */
export const TwoFactorStep = ({ challenge, onBack }: { challenge: string; onBack: () => void }) => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const signedIn = useSignedIn();
  const [recovery, setRecovery] = useState(false);
  const [code, setCode] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const verify = useMutation(orpc.auth.signInTwoFactor.mutationOptions({ onSuccess: signedIn }));
  const incomplete = recovery ? code.trim().length < 8 : code.length !== 6;

  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    setSubmitted(true);

    if (incomplete) return;

    verify.mutate(recovery ? { challenge, recoveryCode: code.trim() } : { challenge, code });
  };

  return (
    // A new key per kind of code, so the cursor moves into the field again when it switches.
    <AuthForm key={String(recovery)} onSubmit={submit} className="mx-auto grid w-full gap-4">
      <AuthField
        label={
          recovery
            ? t('recovery-code', 'Recovery code')
            : t('app-code', 'Code from your authenticator app')
        }
        value={code}
        autoComplete="one-time-code"
        code={recovery ? 'text' : 'digits'}
        onChange={(value) => setCode(recovery ? value : value.replace(/\D/g, '').slice(0, 6))}
        error={
          submitted &&
          incomplete &&
          (recovery
            ? t('recovery-code-required', 'Enter a recovery code')
            : t('app-code-required', 'Enter the 6 digits from the app'))
        }
      />
      <ErrorLine error={verify.error} />
      <Button type="submit" className="h-8" disabled={verify.isPending}>
        {verify.isPending && <Spinner size="sm" />}
        {t('verify', 'Verify')}
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
            setSubmitted(false);
          }}
        >
          {recovery
            ? t('use-app', 'Use the app instead')
            : t('use-recovery', 'Use a recovery code')}
        </button>
      </div>
    </AuthForm>
  );
};

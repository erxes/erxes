import { useQueryClient } from '@tanstack/react-query';
import { Button, Input, Label, Spinner } from 'erxes-ui';
import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, messageOf } from '~/lib/api';
import { SESSION_KEY } from './session';

/** The sign-in's second step: the app's 6-digit code, or a recovery code. */
export const TwoFactorStep = ({ challenge, onBack }: { challenge: string; onBack: () => void }) => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const client = useQueryClient();
  const [recovery, setRecovery] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const session = await api.auth.signInTwoFactor(recovery ? { challenge, recoveryCode: code } : { challenge, code });

      client.setQueryData(SESSION_KEY, session);
    } catch (caught) {
      setError(messageOf(caught));
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto grid w-full gap-4" noValidate>
      <div className="grid gap-2">
        <Label>{recovery ? t('recovery-code', 'Recovery code') : t('app-code', 'Code from your authenticator app')}</Label>
        <Input
          autoFocus
          value={code}
          inputMode={recovery ? 'text' : 'numeric'}
          autoComplete="one-time-code"
          maxLength={recovery ? 40 : 6}
          placeholder={recovery ? 'xxxxx-xxxxx' : '123456'}
          onChange={(event) => setCode(recovery ? event.target.value : event.target.value.replace(/\D/g, ''))}
          className="text-center font-mono tracking-widest"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="h-8" disabled={busy || (recovery ? code.length < 8 : code.length !== 6)}>
        {busy ? <Spinner size="sm" /> : t('verify', 'Verify')}
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
          {recovery ? t('use-app', 'Use the app instead') : t('use-recovery', 'Use a recovery code')}
        </button>
      </div>
    </form>
  );
};

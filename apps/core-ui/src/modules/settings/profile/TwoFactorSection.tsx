import { IconShieldLock } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Input, useToast } from 'erxes-ui';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, messageOf } from '~/lib/api';
import { SESSION_KEY, useSession } from '~/modules/auth/session';

const RecoveryCodes = ({ codes }: { codes: string[] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });

  return (
    <div className="space-y-2 rounded-md border bg-muted/40 p-3">
      <p className="text-sm font-medium">{t('recovery-title', 'Recovery codes: save them now')}</p>
      <p className="text-xs text-muted-foreground">
        {t('recovery-description', "Each works once if you lose your phone. They won't be shown again.")}
      </p>
      <ul className="grid grid-cols-2 gap-1 font-mono text-sm">
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ul>
      <Button size="sm" variant="outline" onClick={() => void navigator.clipboard.writeText(codes.join('\n'))}>
        {t('copy-codes', 'Copy')}
      </Button>
    </div>
  );
};

/** Profile › Two-factor sign-in: set up with an authenticator app, turn off, new recovery codes. */
export const TwoFactorSection = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });
  const { user } = useSession();
  const { toast } = useToast();
  const client = useQueryClient();
  const [setup, setSetup] = useState<{ secret: string; uri: string } | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [codes, setCodes] = useState<string[] | null>(null);
  const onError = (error: unknown) => toast({ variant: 'destructive', title: t('two-factor-failed', 'Could not change two-factor sign-in'), description: messageOf(error) });

  useEffect(() => {
    if (setup) void QRCode.toDataURL(setup.uri, { margin: 1, width: 180 }).then(setQr);
  }, [setup]);

  const start = useMutation({ mutationFn: () => api.auth.twoFactorSetup(), onSuccess: setSetup, onError });
  const enable = useMutation({
    mutationFn: () => api.auth.twoFactorEnable({ code }),
    onSuccess: ({ recoveryCodes }) => {
      setCodes(recoveryCodes);
      setSetup(null);
      setCode('');
      void client.invalidateQueries({ queryKey: SESSION_KEY });
    },
    onError,
  });
  const disable = useMutation({
    mutationFn: () => api.auth.twoFactorDisable({ password }),
    onSuccess: () => {
      setPassword('');
      setCodes(null);
      void client.invalidateQueries({ queryKey: SESSION_KEY });
      toast({ title: t('two-factor-off', 'Two-factor sign-in is off') });
    },
    onError,
  });
  const renew = useMutation({
    mutationFn: () => api.auth.twoFactorRecoveryCodes({ password }),
    onSuccess: ({ recoveryCodes }) => {
      setPassword('');
      setCodes(recoveryCodes);
    },
    onError,
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <IconShieldLock className="size-5" />
        <span className="text-sm font-medium">{t('two-factor', 'Two-factor sign-in')}</span>
        {user.twoFactorEnabled ? <Badge variant="success">{t('on', 'On')}</Badge> : <Badge variant="secondary">{t('off', 'Off')}</Badge>}
      </div>
      <p className="text-sm text-muted-foreground">
        {t('two-factor-description', 'After your password, erxes also asks for a code from an authenticator app (1Password, Google Authenticator, Authy …).')}
      </p>
      {codes && <RecoveryCodes codes={codes} />}
      {!user.twoFactorEnabled && !setup && (
        <Button variant="outline" disabled={start.isPending} onClick={() => start.mutate()}>
          {t('two-factor-start', 'Set up')}
        </Button>
      )}
      {setup && (
        <div className="flex flex-wrap items-start gap-4 rounded-md border p-3">
          {qr && <img src={qr} alt="" className="size-[180px] rounded bg-white p-1" />}
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-sm">{t('scan', 'Scan this with your authenticator app, or type the key:')}</p>
            <code className="block break-all rounded bg-muted p-2 text-xs">{setup.secret}</code>
            <div className="flex gap-2">
              <Input
                className="w-32 text-center font-mono tracking-widest"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
              />
              <Button disabled={code.length !== 6 || enable.isPending} onClick={() => enable.mutate()}>
                {t('two-factor-confirm', 'Turn on')}
              </Button>
            </div>
          </div>
        </div>
      )}
      {user.twoFactorEnabled && (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="password"
            className="w-56"
            autoComplete="current-password"
            placeholder={t('password-to-confirm', 'Your password')}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button variant="outline" disabled={!password || renew.isPending} onClick={() => renew.mutate()}>
            {t('new-recovery-codes', 'New recovery codes')}
          </Button>
          <Button variant="outline" disabled={!password || disable.isPending} onClick={() => disable.mutate()}>
            {t('two-factor-disable', 'Turn off')}
          </Button>
        </div>
      )}
    </div>
  );
};

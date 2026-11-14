import { IconShieldLock } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Input, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf, orpc } from '~/lib/api';
import { useSession } from '~/modules/auth/session';

const RecoveryCodes = ({ codes }: { codes: string[] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });
  const { toast } = useToast();

  const copy = () =>
    navigator.clipboard.writeText(codes.join('\n')).catch((error: unknown) =>
      toast({
        variant: 'destructive',
        title: t('copy-failed', 'Could not copy'),
        description: messageOf(error),
      }),
    );

  return (
    <div className="space-y-2 rounded-md border bg-muted/40 p-3">
      <p className="text-sm font-medium">{t('recovery-title', 'Recovery codes: save them now')}</p>
      <p className="text-xs text-muted-foreground">
        {t(
          'recovery-description',
          "Each works once if you lose your phone. They won't be shown again.",
        )}
      </p>
      <ul className="grid grid-cols-2 gap-1 font-mono text-sm">
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ul>
      <Button size="sm" variant="outline" onClick={() => void copy()}>
        {t('copy-codes', 'Copy')}
      </Button>
    </div>
  );
};

const useTwoFactorError = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });
  const { toast } = useToast();

  return (error: unknown) =>
    toast({
      variant: 'destructive',
      title: t('two-factor-failed', 'Could not change two-factor sign-in'),
      description: messageOf(error),
    });
};

interface Setup {
  secret: string;
  qr: string;
}

/** Scan the QR code, then confirm with the first code from the app. */
const SetupStep = ({
  setup,
  onEnabled,
}: {
  setup: Setup;
  onEnabled: (codes: string[]) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });
  const client = useQueryClient();
  const onError = useTwoFactorError();
  const [code, setCode] = useState('');

  const enable = useMutation(
    orpc.auth.twoFactorEnable.mutationOptions({
      onSuccess: ({ recoveryCodes }) => {
        onEnabled(recoveryCodes);
        void client.invalidateQueries({ queryKey: orpc.auth.me.key() });
      },
      onError,
    }),
  );

  return (
    <div className="flex flex-wrap items-start gap-4 rounded-md border p-3">
      <img src={setup.qr} alt="" className="size-45 rounded bg-white p-1" />
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-sm">
          {t('scan', 'Scan this with your authenticator app, or type the key:')}
        </p>
        <code className="block break-all rounded bg-muted p-2 text-xs">{setup.secret}</code>
        <div className="flex gap-2">
          <Input
            text="otp"
            className="w-32"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            aria-label={t('code', 'Code from the app')}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
          />
          <Button
            disabled={code.length !== 6 || enable.isPending}
            onClick={() => enable.mutate({ code })}
          >
            {t('two-factor-confirm', 'Turn on')}
          </Button>
        </div>
      </div>
    </div>
  );
};

/** With two-factor on: new recovery codes or turn it off, both behind the password. */
const EnabledActions = ({ onCodes }: { onCodes: (codes: string[] | null) => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });
  const { toast } = useToast();
  const client = useQueryClient();
  const onError = useTwoFactorError();
  const [password, setPassword] = useState('');

  const disable = useMutation(
    orpc.auth.twoFactorDisable.mutationOptions({
      onSuccess: () => {
        setPassword('');
        onCodes(null);
        void client.invalidateQueries({ queryKey: orpc.auth.me.key() });
        toast({ title: t('two-factor-off', 'Two-factor sign-in is off') });
      },
      onError,
    }),
  );

  const renew = useMutation(
    orpc.auth.twoFactorRecoveryCodes.mutationOptions({
      onSuccess: ({ recoveryCodes }) => {
        setPassword('');
        onCodes(recoveryCodes);
      },
      onError,
    }),
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        type="password"
        className="w-56"
        autoComplete="current-password"
        placeholder={t('password-to-confirm', 'Your password')}
        aria-label={t('password-to-confirm', 'Your password')}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <Button
        variant="outline"
        disabled={!password || renew.isPending}
        onClick={() => renew.mutate({ password })}
      >
        {t('new-recovery-codes', 'New recovery codes')}
      </Button>
      <Button
        variant="outline"
        disabled={!password || disable.isPending}
        onClick={() => disable.mutate({ password })}
      >
        {t('two-factor-disable', 'Turn off')}
      </Button>
    </div>
  );
};

/** Profile › Two-factor sign-in: set up with an authenticator app, turn off, new recovery codes. */
export const TwoFactorSection = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });
  const { user } = useSession();
  const onError = useTwoFactorError();
  const [setup, setSetup] = useState<Setup | null>(null);
  const [codes, setCodes] = useState<string[] | null>(null);

  const start = useMutation({
    mutationFn: async () => {
      const { secret, uri } = await orpc.auth.twoFactorSetup.call();
      // Loaded when setup starts: settings pages don't carry the QR encoder.
      const { toDataURL } = await import('qrcode');

      return { secret, qr: await toDataURL(uri, { margin: 1, width: 180 }) };
    },
    onSuccess: setSetup,
    onError,
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <IconShieldLock className="size-5" />
        <span className="text-sm font-medium">{t('two-factor', 'Two-factor sign-in')}</span>
        {user.totpEnabledAt ? (
          <Badge variant="success">{t('on', 'On')}</Badge>
        ) : (
          <Badge variant="secondary">{t('off', 'Off')}</Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {t(
          'two-factor-description',
          'After your password, erxes also asks for a code from an authenticator app (1Password, Google Authenticator, Authy …).',
        )}
      </p>
      {codes && <RecoveryCodes codes={codes} />}
      {!user.totpEnabledAt && !setup && (
        <Button variant="outline" disabled={start.isPending} onClick={() => start.mutate()}>
          {t('two-factor-start', 'Set up')}
        </Button>
      )}
      {setup && (
        <SetupStep
          setup={setup}
          onEnabled={(recoveryCodes) => {
            setCodes(recoveryCodes);
            setSetup(null);
          }}
        />
      )}
      {user.totpEnabledAt && <EnabledActions onCodes={setCodes} />}
    </div>
  );
};

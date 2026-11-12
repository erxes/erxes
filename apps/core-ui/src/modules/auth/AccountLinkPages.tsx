import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Input, Label, Spinner } from 'erxes-ui';
import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api, messageOf } from '~/lib/api';
import { SESSION_KEY } from '~/modules/auth/session';
import { AuthBanner, AuthenticationLayout } from './components/AuthenticationLayout';

const Shell = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <div className="z-10 flex min-h-screen w-full">
    <AuthBanner />
    <AuthenticationLayout>
      <div className="flex flex-col items-center gap-3">
        <div className="text-xl font-semibold leading-none">{title}</div>
        {subtitle && <div className="text-center text-accent-foreground">{subtitle}</div>}
      </div>
      {children}
    </AuthenticationLayout>
  </div>
);

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/** "Forgot password?": always says the same, whether or not the email has an account. */
export const ForgotPasswordPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      await api.auth.requestPasswordReset({ email });
      setSent(true);
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell
      title={t('forgot-title', 'Reset your password')}
      subtitle={t('forgot-subtitle', "We'll email you a link to choose a new one.")}
    >
      {sent ? (
        <p className="text-center text-sm">
          {t(
            'forgot-sent',
            'If {{email}} has an account, a link is on its way. It works for 30 minutes.',
            { email },
          )}
        </p>
      ) : (
        <form onSubmit={submit} className="grid w-full gap-4" noValidate>
          <div className="grid gap-2">
            <Label>{t('email', 'Email')}</Label>
            <Input
              type="email"
              autoFocus
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="h-8" disabled={busy || !email}>
            {busy ? <Spinner /> : t('forgot-send', 'Email me a link')}
          </Button>
        </form>
      )}
      <Link to="/" className="text-center text-sm text-muted-foreground hover:underline">
        {t('back-to-sign-in', 'Back to sign in')}
      </Link>
    </Shell>
  );
};

const NewPasswordForm = ({
  submitLabel,
  withName,
  onSubmit,
}: {
  submitLabel: string;
  withName?: boolean;
  onSubmit: (values: { password: string; firstName?: string; lastName?: string }) => Promise<void>;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const weak = password.length > 0 && !PASSWORD_RULE.test(password);
  const mismatch = repeat.length > 0 && repeat !== password;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      await onSubmit({
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      });
    } catch (caught) {
      setError(messageOf(caught));
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid w-full gap-4" noValidate>
      {withName && (
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>{t('first-name', 'First name')}</Label>
            <Input value={firstName} onChange={(event) => setFirstName(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>{t('last-name', 'Last name')}</Label>
            <Input value={lastName} onChange={(event) => setLastName(event.target.value)} />
          </div>
        </div>
      )}
      <div className="grid gap-2">
        <Label>{t('new-password', 'New password')}</Label>
        <Input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <p className={weak ? 'text-xs text-destructive' : 'text-xs text-muted-foreground'}>
          {t(
            'password-rule',
            'At least 8 characters, with a lower-case and an upper-case letter and a digit.',
          )}
        </p>
      </div>
      <div className="grid gap-2">
        <Label>{t('repeat-password', 'Repeat it')}</Label>
        <Input
          type="password"
          autoComplete="new-password"
          value={repeat}
          onChange={(event) => setRepeat(event.target.value)}
        />
        {mismatch && (
          <p className="text-xs text-destructive">
            {t('password-mismatch', "The passwords don't match")}
          </p>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        type="submit"
        className="h-8"
        disabled={busy || weak || mismatch || !password || password !== repeat}
      >
        {busy ? <Spinner /> : submitLabel}
      </Button>
    </form>
  );
};

/** The emailed reset link: choose a new password; signs in on this browser. */
export const ResetPasswordPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const client = useQueryClient();
  const navigate = useNavigate();

  return (
    <Shell
      title={t('reset-title', 'Choose a new password')}
      subtitle={t('reset-subtitle', 'Other devices are signed out when you save it.')}
    >
      <NewPasswordForm
        submitLabel={t('reset-save', 'Save and sign in')}
        onSubmit={async ({ password }) => {
          const session = await api.auth.resetPassword({ token, password });

          client.setQueryData(SESSION_KEY, session);
          navigate('/', { replace: true });
        }}
      />
    </Shell>
  );
};

/** The invitation link: who invited you where; choose a password to join. */
export const AcceptInvitationPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const client = useQueryClient();
  const navigate = useNavigate();
  const info = useQuery({
    queryKey: ['invitation', token],
    queryFn: () => api.auth.invitation({ token }),
    retry: false,
  });

  if (info.isPending) {
    return (
      <div className="flex h-svh items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (info.isError) {
    return (
      <Shell
        title={t('invite-invalid', 'This invitation link has expired')}
        subtitle={messageOf(info.error)}
      >
        <Link to="/" className="text-center text-sm text-muted-foreground hover:underline">
          {t('back-to-sign-in', 'Back to sign in')}
        </Link>
      </Shell>
    );
  }

  return (
    <Shell
      title={t('invite-title', 'Join {{organization}}', { organization: info.data.organization })}
      subtitle={
        info.data.inviter
          ? t('invite-subtitle', '{{inviter}} invited {{email}}.', {
              inviter: info.data.inviter,
              email: info.data.email,
            })
          : info.data.email
      }
    >
      <NewPasswordForm
        withName
        submitLabel={t('invite-accept', 'Join')}
        onSubmit={async (values) => {
          const session = await api.auth.acceptInvitation({ token, ...values });

          client.setQueryData(SESSION_KEY, session);
          navigate('/', { replace: true });
        }}
      />
    </Shell>
  );
};

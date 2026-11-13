import type { Session } from '@erxes/core-contract';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Input, Label, Spinner } from 'erxes-ui';
import { type SubmitEvent, type ReactNode, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { messageOf, orpc } from '~/lib/api';
import { useSignedIn } from '~/modules/auth/session';
import { AuthBanner, AuthenticationLayout } from './components/AuthenticationLayout';

const Shell = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
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

const BackToSignIn = () => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });

  return (
    <Link to="/" className="text-center text-sm text-muted-foreground hover:underline">
      {t('back-to-sign-in', 'Back to sign in')}
    </Link>
  );
};

const ErrorLine = ({ error }: { error: Error | null }) =>
  error ? (
    <p role="alert" className="text-sm text-destructive">
      {messageOf(error)}
    </p>
  ) : null;

/** A labelled input. */
const Field = ({
  label,
  value,
  onChange,
  type = 'text',
  autoComplete,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  /** A hint or problem under the input. */
  children?: ReactNode;
}) => {
  const id = useId();

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {children}
    </div>
  );
};

/** "Forgot password?": always says the same, whether or not the email has an account. */
export const ForgotPasswordPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const [email, setEmail] = useState('');
  const request = useMutation(orpc.auth.requestPasswordReset.mutationOptions());

  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    request.mutate({ email });
  };

  return (
    <Shell
      title={t('forgot-title', 'Reset your password')}
      subtitle={t('forgot-subtitle', "We'll email you a link to choose a new one.")}
    >
      {request.isSuccess ? (
        <p className="text-center text-sm">
          {t(
            'forgot-sent',
            'If {{email}} has an account, a link is on its way. It works for 30 minutes.',
            { email },
          )}
        </p>
      ) : (
        <form onSubmit={submit} className="grid w-full gap-4" noValidate>
          <Field
            label={t('email', 'Email')}
            type="email"
            autoComplete="username"
            value={email}
            onChange={setEmail}
          />
          <ErrorLine error={request.error} />
          <Button type="submit" className="h-8" disabled={request.isPending || !email}>
            {request.isPending ? <Spinner /> : t('forgot-send', 'Email me a link')}
          </Button>
        </form>
      )}
      <BackToSignIn />
    </Shell>
  );
};

interface NewPasswordValues {
  password: string;
  firstName?: string;
  lastName?: string;
}

const NameFields = ({
  firstName,
  lastName,
  onFirstName,
  onLastName,
}: {
  firstName: string;
  lastName: string;
  onFirstName: (value: string) => void;
  onLastName: (value: string) => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });

  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label={t('first-name', 'First name')} value={firstName} onChange={onFirstName} />
      <Field label={t('last-name', 'Last name')} value={lastName} onChange={onLastName} />
    </div>
  );
};

/** A new password, typed twice and checked against the rule; with `withName`, the name too. */
const NewPasswordForm = ({
  submitLabel,
  withName,
  pending,
  error,
  onSubmit,
}: {
  submitLabel: string;
  withName?: boolean;
  pending: boolean;
  error: Error | null;
  onSubmit: (values: NewPasswordValues) => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const weak = password.length > 0 && !PASSWORD_RULE.test(password);
  const mismatch = repeat.length > 0 && repeat !== password;

  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    onSubmit({ password, firstName: firstName || undefined, lastName: lastName || undefined });
  };

  return (
    <form onSubmit={submit} className="grid w-full gap-4" noValidate>
      {withName && (
        <NameFields
          firstName={firstName}
          lastName={lastName}
          onFirstName={setFirstName}
          onLastName={setLastName}
        />
      )}
      <Field
        label={t('new-password', 'New password')}
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={setPassword}
      >
        <p className={weak ? 'text-xs text-destructive' : 'text-xs text-muted-foreground'}>
          {t(
            'password-rule',
            'At least 8 characters, with a lower-case and an upper-case letter and a digit.',
          )}
        </p>
      </Field>
      <Field
        label={t('repeat-password', 'Repeat it')}
        type="password"
        autoComplete="new-password"
        value={repeat}
        onChange={setRepeat}
      >
        {mismatch && (
          <p className="text-xs text-destructive">
            {t('password-mismatch', "The passwords don't match")}
          </p>
        )}
      </Field>
      <ErrorLine error={error} />
      <Button
        type="submit"
        className="h-8"
        disabled={pending || weak || mismatch || !password || password !== repeat}
      >
        {pending ? <Spinner /> : submitLabel}
      </Button>
    </form>
  );
};

/** Signs in with the session the link returned and opens the app. */
const useEnterApp = () => {
  const signedIn = useSignedIn();
  const navigate = useNavigate();

  return (session: Session) => {
    signedIn(session);
    void navigate('/', { replace: true });
  };
};

/** The emailed reset link: choose a new password; signs in on this browser. */
export const ResetPasswordPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const enterApp = useEnterApp();
  const reset = useMutation(orpc.auth.resetPassword.mutationOptions({ onSuccess: enterApp }));

  return (
    <Shell
      title={t('reset-title', 'Choose a new password')}
      subtitle={t('reset-subtitle', 'Other devices are signed out when you save it.')}
    >
      <NewPasswordForm
        submitLabel={t('reset-save', 'Save and sign in')}
        pending={reset.isPending}
        error={reset.error}
        onSubmit={({ password }) => reset.mutate({ token, password })}
      />
    </Shell>
  );
};

/** The invitation link: who invited you where; choose a password to join. */
export const AcceptInvitationPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const info = useQuery(orpc.auth.invitation.queryOptions({ input: { token }, retry: false }));
  const enterApp = useEnterApp();
  const accept = useMutation(orpc.auth.acceptInvitation.mutationOptions({ onSuccess: enterApp }));

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
        <BackToSignIn />
      </Shell>
    );
  }

  const { organization, inviter, email } = info.data;

  return (
    <Shell
      title={t('invite-title', 'Join {{organization}}', { organization })}
      subtitle={
        inviter ? t('invite-subtitle', '{{inviter}} invited {{email}}.', { inviter, email }) : email
      }
    >
      <NewPasswordForm
        withName
        submitLabel={t('invite-accept', 'Join')}
        pending={accept.isPending}
        error={accept.error}
        onSubmit={(values) => accept.mutate({ token, ...values })}
      />
    </Shell>
  );
};

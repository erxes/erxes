import { paths } from '~/lib/paths';
import type { Session } from '@erxes/core-contract';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Spinner } from 'erxes-ui';
import { type SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { parseAsString, useQueryState } from 'nuqs';
import { useNavigate } from 'react-router-dom';
import { orpc } from '@erxes/core-contract/client';
import { useSignedIn } from '~/modules/auth/session';
import { AuthField, AuthForm, AuthShell, BackToSignIn, ErrorLine } from './components/AuthParts';

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** "Forgot password?": always says the same, whether or not the email has an account. */
export const ForgotPasswordPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const request = useMutation(orpc.auth.requestPasswordReset.mutationOptions());
  const invalid = !EMAIL.test(email.trim());

  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    setSubmitted(true);

    if (!invalid) request.mutate({ email: email.trim() });
  };

  return (
    <AuthShell
      title={t('forgot-title', 'Reset your password')}
      subtitle={t('forgot-subtitle', "We'll email you a link to choose a new one.")}
    >
      {request.isSuccess ? (
        <output className="block text-center text-sm">
          {t(
            'forgot-sent',
            'If {{email}} has an account, a link is on its way. It works for 30 minutes.',
            { email },
          )}
        </output>
      ) : (
        <AuthForm onSubmit={submit} className="grid w-full gap-4">
          <AuthField
            label={t('email', 'Email')}
            type="email"
            autoComplete="username"
            value={email}
            onChange={setEmail}
            error={
              submitted && invalid && t('email-invalid', 'Enter your email, like name@example.com')
            }
          />
          <ErrorLine error={request.error} />
          <Button type="submit" className="h-8" disabled={request.isPending}>
            {request.isPending && <Spinner size="sm" />}
            {t('forgot-send', 'Email me a link')}
          </Button>
        </AuthForm>
      )}
      <BackToSignIn />
    </AuthShell>
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
      <AuthField
        label={t('first-name', 'First name')}
        autoComplete="given-name"
        value={firstName}
        onChange={onFirstName}
      />
      <AuthField
        label={t('last-name', 'Last name')}
        autoComplete="family-name"
        value={lastName}
        onChange={onLastName}
      />
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
  // Problems show once the button was pressed; before that the rule is a hint.
  const [submitted, setSubmitted] = useState(false);
  const weak = !PASSWORD_RULE.test(password);
  const mismatch = repeat !== password;

  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    setSubmitted(true);

    if (weak || mismatch) return;

    onSubmit({
      password,
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
    });
  };

  const rule = t(
    'password-rule',
    'At least 8 characters, with a lower-case and an upper-case letter and a digit.',
  );

  return (
    <AuthForm onSubmit={submit} className="grid w-full gap-4">
      {withName && (
        <NameFields
          firstName={firstName}
          lastName={lastName}
          onFirstName={setFirstName}
          onLastName={setLastName}
        />
      )}
      <AuthField
        label={t('new-password', 'New password')}
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={setPassword}
        hint={rule}
        error={submitted && weak && rule}
      />
      <AuthField
        label={t('repeat-password', 'Repeat it')}
        type="password"
        autoComplete="new-password"
        value={repeat}
        onChange={setRepeat}
        error={
          submitted && !weak && mismatch && t('password-mismatch', "The passwords don't match")
        }
      />
      <ErrorLine error={error} />
      <Button type="submit" className="h-8" disabled={pending}>
        {pending && <Spinner size="sm" />}
        {submitLabel}
      </Button>
    </AuthForm>
  );
};

/** Signs in with the session the link returned and opens the app. */
const useEnterApp = () => {
  const signedIn = useSignedIn();
  const navigate = useNavigate();

  return (session: Session) => {
    signedIn(session);
    void navigate(paths.home, { replace: true });
  };
};

/** The emailed reset link: choose a new password; signs in on this browser. */
export const ResetPasswordPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const [token] = useQueryState('token', parseAsString.withDefault(''));
  const enterApp = useEnterApp();
  const reset = useMutation(orpc.auth.resetPassword.mutationOptions({ onSuccess: enterApp }));

  return (
    <AuthShell
      title={t('reset-title', 'Choose a new password')}
      subtitle={t('reset-subtitle', 'Other devices are signed out when you save it.')}
    >
      <NewPasswordForm
        submitLabel={t('reset-save', 'Save and sign in')}
        pending={reset.isPending}
        error={reset.error}
        onSubmit={({ password }) => reset.mutate({ token, password })}
      />
      <BackToSignIn />
    </AuthShell>
  );
};

/** The invitation link: who invited you where; choose a password to join. */
export const AcceptInvitationPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const [token] = useQueryState('token', parseAsString.withDefault(''));
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
      <AuthShell
        title={t('invite-invalid', 'This invitation link has expired')}
        subtitle={t(
          'invite-invalid-description',
          'It was used, replaced or is too old. Ask whoever invited you to send a new one.',
        )}
      >
        <BackToSignIn />
      </AuthShell>
    );
  }

  const { organization, inviter, email } = info.data;

  return (
    <AuthShell
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
    </AuthShell>
  );
};

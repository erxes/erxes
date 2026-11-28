import { paths } from '~/lib/paths';
import { Input, Label, useFocusFirstField } from 'erxes-ui';
import { type ReactNode, type SubmitEvent, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { messageOf } from '@erxes/core-contract/client';
import { AuthBanner, AuthenticationLayout } from './AuthenticationLayout';

/** A signed-out page: the banner, then the title, a line under it and the page's form. */
export const AuthShell = ({
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
        <h1 className="text-center text-xl font-semibold leading-tight">{title}</h1>
        {subtitle && <p className="text-center text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </AuthenticationLayout>
  </div>
);

/** A signed-out page's one form, with the cursor in its first field. */
export const AuthForm = ({
  onSubmit,
  className,
  children,
}: {
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  className: string;
  children: ReactNode;
}) => {
  const ref = useRef<HTMLFormElement>(null);

  useFocusFirstField(ref);

  return (
    <form ref={ref} onSubmit={onSubmit} className={className} noValidate>
      {children}
    </form>
  );
};

export const BackToSignIn = () => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });

  return (
    <Link
      to={paths.home}
      className="block text-center text-sm text-muted-foreground hover:underline"
    >
      {t('back-to-sign-in', 'Back to sign in')}
    </Link>
  );
};

/** What the server said went wrong, over the button. */
export const ErrorLine = ({ error }: { error: Error | null }) =>
  error ? (
    <p role="alert" className="text-center text-sm text-destructive-text">
      {messageOf(error)}
    </p>
  ) : null;

/** A labelled input, as on the sign-in form; `error` shows under it in place of the hint. */
export const AuthField = ({
  label,
  value,
  onChange,
  type = 'text',
  autoComplete,
  code,
  hint,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  /** A one-time code: digits on a phone's keyboard, spaced and centred. */
  code?: 'digits' | 'text';
  /** What the field takes, under the input while it has no error. */
  hint?: ReactNode;
  error?: string | false;
}) => {
  const id = useId();
  const messageId = `${id}-message`;

  return (
    <div className="grid gap-2">
      <Label htmlFor={id} variant="plain">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        autoComplete={autoComplete}
        inputMode={code === 'digits' ? 'numeric' : undefined}
        text={code ? 'otp' : undefined}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? messageId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p id={messageId} className="text-xs text-destructive-text">
          {error}
        </p>
      ) : (
        hint && (
          <p id={messageId} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  );
};

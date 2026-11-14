import { paths } from '~/lib/paths';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { Button, Form, Input, InputGroup, Spinner } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { type ControllerRenderProps, useForm, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { isApiError, messageOf, orpc } from '@erxes/core-contract/client';
import { useSignedIn } from '~/modules/auth/session';
import { AuthBanner, AuthenticationLayout } from './components/AuthenticationLayout';
import { TwoFactorStep } from './TwoFactorStep';

const PASSWORD_REVEAL_MS = 10_000;

const schema = z.object({
  email: z.string().trim().check(z.email('Enter your email')),
  password: z.string().min(1, 'Enter your password'),
  subdomain: z.string().trim().optional(),
});

type Values = z.infer<typeof schema>;

/** The password with a reveal button; a revealed password hides itself again after 10 s. */
const PasswordInput = ({
  ref,
  field,
  ...slotProps
}: { field: ControllerRenderProps<Values, 'password'> } & React.RefAttributes<HTMLDivElement>) => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!shown) return undefined;

    const timer = setTimeout(() => setShown(false), PASSWORD_REVEAL_MS);

    return () => clearTimeout(timer);
  }, [shown]);

  return (
    <InputGroup ref={ref} {...slotProps}>
      <InputGroup.Input
        {...field}
        type={shown ? 'text' : 'password'}
        autoComplete="current-password"
        placeholder={t('enter-your-password')}
      />
      <InputGroup.Addon align="end">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          tone="muted"
          onClick={() => setShown((value) => !value)}
          aria-label={shown ? t('hide-password') : t('show-password')}
          className="size-6"
        >
          {shown ? <IconEyeOff size={15} stroke={1.75} /> : <IconEye size={15} stroke={1.75} />}
        </Button>
      </InputGroup.Addon>
    </InputGroup>
  );
};

const SignInTextField = ({
  name,
  label,
  type,
  autoComplete,
  placeholder,
}: {
  name: 'email' | 'subdomain';
  label: string;
  type?: 'email';
  autoComplete: string;
  placeholder: string;
}) => {
  const { control } = useFormContext<Values>();

  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label variant="plain">{label}</Form.Label>
          <Form.Control>
            <Input {...field} type={type} autoComplete={autoComplete} placeholder={placeholder} />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

/** Email and password; asks for the organisation when the email belongs to several. */
const SignInForm = ({ onChallenge }: { onChallenge: (challenge: string) => void }) => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const signedIn = useSignedIn();
  const [needsOrganization, setNeedsOrganization] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', subdomain: '' },
  });

  const signIn = useMutation(
    orpc.auth.signIn.mutationOptions({
      onSuccess: (result) =>
        'challenge' in result ? onChallenge(result.challenge) : signedIn(result),
      onError: (error) => {
        if (isApiError(error, 'ORGANIZATION_REQUIRED')) setNeedsOrganization(true);
      },
    }),
  );

  const onSubmit = form.handleSubmit((values) =>
    signIn.mutate({ ...values, subdomain: values.subdomain || undefined }),
  );

  return (
    <Form {...form}>
      <form
        onSubmit={(event) => void onSubmit(event)}
        className="mx-auto grid w-full gap-6"
        noValidate
      >
        <SignInTextField
          name="email"
          label={t('email')}
          type="email"
          autoComplete="username"
          placeholder={t('enter-your-email')}
        />
        <Form.Field
          control={form.control}
          name="password"
          render={({ field }) => (
            <Form.Item>
              <Form.Label variant="plain">{t('password')}</Form.Label>
              <Form.Control>
                <PasswordInput field={field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        {needsOrganization && (
          <SignInTextField
            name="subdomain"
            label="Organization address"
            autoComplete="organization"
            placeholder="acme"
          />
        )}
        {signIn.isError && (
          <p role="alert" className="text-center text-sm text-destructive">
            {messageOf(signIn.error)}
          </p>
        )}
        <Button type="submit" className="h-8" disabled={signIn.isPending}>
          {signIn.isPending && <Spinner size="sm" />}
          {t('sign-in')}
        </Button>
        <Link
          to={paths.forgotPassword}
          className="text-center text-sm text-muted-foreground hover:underline"
        >
          {t('forgot-password', 'Forgot your password?')}
        </Link>
      </form>
    </Form>
  );
};

/** Sign-in beside the banner; a second step when two-step sign-in is on. */
export const SignInPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const [challenge, setChallenge] = useState<string | null>(null);

  return (
    <div className="z-10 flex min-h-screen w-full">
      <AuthBanner />
      <AuthenticationLayout>
        <div className="flex flex-col items-center gap-3">
          <div className="text-xl font-semibold leading-none">{t('welcome')}</div>
          <div className="text-center text-muted-foreground">{t('sign-in-to-continue')}</div>
        </div>
        {challenge ? (
          <TwoFactorStep challenge={challenge} onBack={() => setChallenge(null)} />
        ) : (
          <SignInForm onChallenge={setChallenge} />
        )}
      </AuthenticationLayout>
    </div>
  );
};

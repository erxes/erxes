import { zodResolver } from '@hookform/resolvers/zod';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { Button, Form, Input, Spinner } from 'erxes-ui';
import { forwardRef, useEffect, useState } from 'react';
import { type ControllerRenderProps, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { isApiError, messageOf, orpc } from '~/lib/api';
import { useSignedIn } from '~/modules/auth/session';
import { AuthBanner, AuthenticationLayout } from './components/AuthenticationLayout';
import { TwoFactorStep } from './TwoFactorStep';

const PASSWORD_REVEAL_MS = 10_000;

const LABEL = 'font-sans text-sm font-medium normal-case leading-none text-foreground';

const schema = z.object({
  email: z.string().trim().email('Enter your email'),
  password: z.string().min(1, 'Enter your password'),
  subdomain: z.string().trim().optional(),
});

type Values = z.infer<typeof schema>;

/** The password with a reveal button; a revealed password hides itself again, as in old core-ui. */
const PasswordInput = forwardRef<
  HTMLDivElement,
  { field: ControllerRenderProps<Values, 'password'> }
>(({ field, ...slotProps }, ref) => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!shown) return undefined;

    const timer = setTimeout(() => setShown(false), PASSWORD_REVEAL_MS);

    return () => clearTimeout(timer);
  }, [shown]);

  return (
    <div ref={ref} {...slotProps} className="relative">
      <Input
        {...field}
        type={shown ? 'text' : 'password'}
        autoComplete="current-password"
        placeholder={t('enter-your-password')}
        className="pr-9"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setShown((value) => !value)}
        aria-label={shown ? t('hide-password') : t('show-password')}
        className="absolute inset-y-0 right-1 my-auto size-6 rounded-sm p-0 text-accent-foreground/60 hover:text-foreground"
      >
        {shown ? <IconEyeOff size={15} stroke={1.75} /> : <IconEye size={15} stroke={1.75} />}
      </Button>
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

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
      <form onSubmit={onSubmit} className="mx-auto grid w-full gap-6" noValidate>
        <Form.Field
          control={form.control}
          name="email"
          render={({ field }) => (
            <Form.Item>
              <Form.Label className={LABEL}>{t('email')}</Form.Label>
              <Form.Control>
                <Input
                  {...field}
                  type="email"
                  autoComplete="username"
                  placeholder={t('enter-your-email')}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="password"
          render={({ field }) => (
            <Form.Item>
              <Form.Label className={LABEL}>{t('password')}</Form.Label>
              <Form.Control>
                <PasswordInput field={field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        {needsOrganization && (
          <Form.Field
            control={form.control}
            name="subdomain"
            render={({ field }) => (
              <Form.Item>
                <Form.Label className={LABEL}>Organization address</Form.Label>
                <Form.Control>
                  <Input {...field} placeholder="acme" autoComplete="organization" />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
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
          to="/forgot-password"
          className="text-center text-sm text-muted-foreground hover:underline"
        >
          {t('forgot-password', 'Forgot your password?')}
        </Link>
      </form>
    </Form>
  );
};

/** Sign-in, laid out as old core-ui's login page; a second step when two-step sign-in is on. */
export const SignInPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const [challenge, setChallenge] = useState<string | null>(null);

  return (
    <div className="z-10 flex min-h-screen w-full">
      <AuthBanner />
      <AuthenticationLayout>
        <div className="flex flex-col items-center gap-3">
          <div className="text-xl font-semibold leading-none">{t('welcome')}</div>
          <div className="text-center text-accent-foreground">{t('sign-in-to-continue')}</div>
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

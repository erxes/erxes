import { zodResolver } from '@hookform/resolvers/zod';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, Spinner } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { api, isApiError } from '~/lib/api';
import { SESSION_KEY } from '~/modules/auth/session';
import { AuthBanner, AuthenticationLayout } from './components/AuthenticationLayout';

const PASSWORD_REVEAL_MS = 10_000;

const schema = z.object({
  email: z.string().trim().email('Enter your email'),
  password: z.string().min(1, 'Enter your password'),
  subdomain: z.string().trim().optional(),
});

type Values = z.infer<typeof schema>;

/** Sign-in, laid out as old core-ui's login page (email and password only for now). */
export const SignInPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const client = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [needsOrganization, setNeedsOrganization] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', subdomain: '' },
  });

  // A revealed password hides itself again, as in old core-ui.
  useEffect(() => {
    if (!showPassword) return undefined;

    const timer = setTimeout(() => setShowPassword(false), PASSWORD_REVEAL_MS);

    return () => clearTimeout(timer);
  }, [showPassword]);

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);

    try {
      const session = await api.auth.signIn({
        email: values.email,
        password: values.password,
        subdomain: values.subdomain || undefined,
      });

      client.setQueryData(SESSION_KEY, session);
    } catch (caught) {
      if (isApiError(caught, 'ORGANIZATION_REQUIRED')) {
        setNeedsOrganization(true);
      }

      setError(caught instanceof Error ? caught.message : 'Could not sign in');
    }
  });

  return (
    <div className="z-10 flex min-h-screen w-full">
      <AuthBanner />
      <AuthenticationLayout>
        <div className="flex flex-col items-center gap-3">
          <div className="text-xl font-semibold leading-none">{t('welcome')}</div>
          <div className="text-center text-accent-foreground">{t('sign-in-to-continue')}</div>
        </div>
        <Form {...form}>
          <form onSubmit={onSubmit} className="mx-auto grid w-full gap-6" noValidate>
            <Form.Field
              control={form.control}
              name="email"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="font-sans text-sm font-medium normal-case leading-none text-foreground">
                    {t('email')}
                  </Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      autoFocus
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
                  <Form.Label className="font-sans text-sm font-medium normal-case leading-none text-foreground">
                    {t('password')}
                  </Form.Label>
                  <Form.Control>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder={t('enter-your-password')}
                        className="pr-9"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword((shown) => !shown)}
                        aria-label={showPassword ? t('hide-password') : t('show-password')}
                        className="absolute inset-y-0 right-1 my-auto size-6 rounded-sm p-0 text-accent-foreground/60 hover:text-foreground"
                      >
                        {showPassword ? <IconEyeOff size={15} stroke={1.75} /> : <IconEye size={15} stroke={1.75} />}
                      </Button>
                    </div>
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
                    <Form.Label className="font-sans text-sm font-medium normal-case leading-none text-foreground">
                      Organization address
                    </Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder="acme" autoComplete="organization" />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            )}
            {error && (
              <p role="alert" className="text-center text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" className="h-8" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Spinner size="sm" />}
              {t('sign-in')}
            </Button>
            <Link to="/forgot-password" className="text-center text-sm text-muted-foreground hover:underline">
              {t('forgot-password', 'Forgot your password?')}
            </Link>
          </form>
        </Form>
      </AuthenticationLayout>
    </div>
  );
};

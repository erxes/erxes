'use client';

import { useApolloClient, useMutation } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from 'erxes-ui/components/form';
import { toast } from 'erxes-ui/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { PasswordInput, TextInput } from '@/modules/ui/components/FormInput';
import { Button } from '@/modules/ui/components/Button';
import { Icon } from '@/modules/ui/components/Icon';
import { useT } from '@/modules/i18n/components/LocaleProvider';
import type { Translate } from '@/modules/i18n/translate';
import { authErrorMessage } from '../utils/errors';
import { PASSWORD_RULE } from '../utils/password';
import { withNext } from '../utils/redirect';
import {
  AUTH_PORTAL_LOGIN,
  AUTH_PORTAL_REGISTER,
} from '../graphql/mutations/auth';
import { AUTH_PORTAL_CURRENT_USER } from '../graphql/queries/auth';
import { useSession } from './SessionProvider';
import {
  displayName,
  loginToken,
  sessionFromCurrentUser,
  type CurrentUserResponse,
  type LoginResponse,
  type RegisterResponse,
} from '../types';

const signUpSchema = (t: Translate) =>
  z
    .object({
      name: z.string().refine((value) => value.trim().length > 0, {
        message: t('validation.name'),
      }),
      email: z.string().email(t('validation.email')),
      password: z.string().regex(PASSWORD_RULE, t('auth.passwordHint')),
      confirm: z.string(),
    })
    .refine((values) => values.confirm === values.password, {
      message: t('validation.passwordMatch'),
      path: ['confirm'],
    });

type SignUpValues = z.infer<ReturnType<typeof signUpSchema>>;

export const SignUpForm = ({ next }: { next?: string | null }) => {
  const router = useRouter();
  const t = useT();
  const client = useApolloClient();
  const { signIn } = useSession();

  const [register, { loading: registering }] =
    useMutation<RegisterResponse>(AUTH_PORTAL_REGISTER);
  const [login, { loading: signingIn }] =
    useMutation<LoginResponse>(AUTH_PORTAL_LOGIN);

  const loading = registering || signingIn;

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema(t)),
    defaultValues: { name: '', email: '', password: '', confirm: '' },
  });

  const onSubmit = async ({ name, email, password }: SignUpValues) => {
    const address = email.trim();
    const [firstName, ...rest] = name.trim().split(/\s+/);

    try {
      const { data } = await register({
        variables: {
          email: address,
          password,
          firstName,
          lastName: rest.join(' ') || null,
        },
      });

      const created = data?.clientPortalUserRegister;

      if (!created) {
        throw new Error(t('auth.createFailed'));
      }

      if (!created.isVerified) {
        toast({
          title: t('auth.accountCreated'),
          description: t('auth.confirmEmail'),
        });
        router.replace(withNext('/sign-in', next ?? null));
        return;
      }

      const { data: loggedIn } = await login({
        variables: { email: address, password },
      });

      const token = loginToken(
        loggedIn?.clientPortalUserLoginWithCredentials ?? null,
      );

      const { data: session } = await client.query<CurrentUserResponse>({
        query: AUTH_PORTAL_CURRENT_USER,
        fetchPolicy: 'network-only',
        context: token
          ? { headers: { 'client-auth-token': token } }
          : undefined,
      });

      const current = session?.clientPortalCurrentUser;

      if (!current) {
        throw new Error(t('auth.noUser'));
      }

      signIn(sessionFromCurrentUser(current, address), token);

      toast({
        variant: 'success',
        title: t('auth.accountReady'),
        description: t('auth.welcomeName', { name: displayName(current) }),
      });

      router.replace(next ?? '/');
    } catch (caught) {
      const message = authErrorMessage(caught, t);

      form.setError('root', { message });
      toast({
        variant: 'destructive',
        title: t('auth.signUpFailed'),
        description: message,
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="space-y-5"
      >
        <Form.Field
          control={form.control}
          name="name"
          render={({ field }) => (
            <Form.Item>
              <Form.Label
                className="text-[13px] font-medium text-ink"
                variant="peer"
              >
                {t('field.name')}
              </Form.Label>
              <Form.Control>
                <TextInput
                  {...field}
                  autoComplete="name"
                  placeholder={t('field.namePlaceholder')}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="email"
          render={({ field }) => (
            <Form.Item>
              <Form.Label
                className="text-[13px] font-medium text-ink"
                variant="peer"
              >
                {t('field.email')}
              </Form.Label>
              <Form.Control>
                <TextInput
                  {...field}
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
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
              <Form.Label
                className="text-[13px] font-medium text-ink"
                variant="peer"
              >
                {t('field.password')}
              </Form.Label>
              <Form.Control>
                <PasswordInput
                  {...field}
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
              </Form.Control>
              <Form.Description>
                At least 8 characters, with an uppercase letter, a lowercase
                letter and a number.
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="confirm"
          render={({ field }) => (
            <Form.Item>
              <Form.Label
                className="text-[13px] font-medium text-ink"
                variant="peer"
              >
                {t('field.confirmPassword')}
              </Form.Label>
              <Form.Control>
                <PasswordInput
                  {...field}
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        {form.formState.errors.root ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-danger-soft px-3.5 py-2.5 text-[13px] leading-relaxed text-danger"
          >
            <Icon name="alert" size={15} className="mt-px shrink-0" />
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="mt-2 w-full"
        >
          {loading ? t('auth.signingUp') : t('auth.signUp')}
        </Button>
      </form>
    </Form>
  );
};

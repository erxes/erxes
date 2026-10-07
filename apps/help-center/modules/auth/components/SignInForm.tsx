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
import { AUTH_PORTAL_LOGIN } from '../graphql/mutations/auth';
import { AUTH_PORTAL_CURRENT_USER } from '../graphql/queries/auth';
import { useSession } from './SessionProvider';
import {
  displayName,
  loginToken,
  sessionFromCurrentUser,
  type CurrentUserResponse,
  type LoginResponse,
} from '../types';

const signInSchema = (t: Translate) =>
  z.object({
    email: z.string().email(t('validation.email')),
    password: z.string().min(1, t('validation.password')),
  });

type SignInValues = z.infer<ReturnType<typeof signInSchema>>;

export const SignInForm = ({ next }: { next?: string | null }) => {
  const router = useRouter();
  const t = useT();
  const client = useApolloClient();
  const { signIn } = useSession();
  const [login, { loading }] = useMutation<LoginResponse>(AUTH_PORTAL_LOGIN);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema(t)),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async ({ email, password }: SignInValues) => {
    const address = email.trim();

    try {
      const { data } = await login({
        variables: { email: address, password },
      });

      const token = loginToken(
        data?.clientPortalUserLoginWithCredentials ?? null,
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
        title: t('auth.signedIn'),
        description: t('auth.welcomeBackName', { name: displayName(current) }),
      });

      router.replace(next ?? '/');
    } catch (caught) {
      const message = authErrorMessage(caught, t);

      form.setError('root', { message });
      toast({
        variant: 'destructive',
        title: t('auth.signInFailed'),
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
                  autoComplete="current-password"
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
          {loading ? t('auth.signingIn') : t('auth.signIn')}
        </Button>
      </form>
    </Form>
  );
};

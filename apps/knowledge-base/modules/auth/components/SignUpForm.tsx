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
import { authErrorMessage } from '../utils/errors';
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

/** Mirrors the portal's own rule, so the server never rejects what passed here. */
const PASSWORD_RULE = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

const signUpSchema = z
  .object({
    name: z.string().refine((value) => value.trim().length > 0, {
      message: 'Нэрээ оруулна уу.',
    }),
    email: z.string().email('Имэйл хаяг буруу байна.'),
    password: z
      .string()
      .regex(
        PASSWORD_RULE,
        'Нууц үг том, жижиг үсэг, тоо агуулсан 8-аас доошгүй тэмдэгт байх ёстой.',
      ),
    confirm: z.string(),
  })
  .refine((values) => values.confirm === values.password, {
    message: 'Нууц үг таарахгүй байна.',
    path: ['confirm'],
  });

type SignUpValues = z.infer<typeof signUpSchema>;

export const SignUpForm = ({ next }: { next?: string | null }) => {
  const router = useRouter();
  const client = useApolloClient();
  const { signIn } = useSession();

  const [register, { loading: registering }] =
    useMutation<RegisterResponse>(AUTH_PORTAL_REGISTER);
  const [login, { loading: signingIn }] =
    useMutation<LoginResponse>(AUTH_PORTAL_LOGIN);

  const loading = registering || signingIn;

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
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
        throw new Error('Бүртгэл үүсгэж чадсангүй.');
      }

      /*
       * Portals that require email verification create the account unverified,
       * and logging in before it is confirmed is rejected by the API.
       */
      if (!created.isVerified) {
        toast({
          title: 'Бүртгэл үүслээ',
          description:
            'Имэйл рүү илгээсэн зааврын дагуу бүртгэлээ баталгаажуулаад нэвтэрнэ үү.',
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
        throw new Error('Нэвтэрсэн хэрэглэгчийн мэдээлэл ирсэнгүй.');
      }

      signIn(sessionFromCurrentUser(current, address), token);

      toast({
        variant: 'success',
        title: 'Бүртгэл амжилттай үүслээ',
        description: `Тавтай морил, ${displayName(current)}.`,
      });

      router.replace(next ?? '/');
    } catch (caught) {
      const message = authErrorMessage(caught);

      form.setError('root', { message });
      toast({
        variant: 'destructive',
        title: 'Бүртгүүлж чадсангүй',
        description: message,
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="space-y-4"
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
                Нэр
              </Form.Label>
              <Form.Control>
                <TextInput
                  {...field}
                  autoComplete="name"
                  placeholder="Таны нэр"
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
                Имэйл
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
                Нууц үг
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

        <Form.Field
          control={form.control}
          name="confirm"
          render={({ field }) => (
            <Form.Item>
              <Form.Label
                className="text-[13px] font-medium text-ink"
                variant="peer"
              >
                Нууц үг давтах
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

        <Button type="submit" disabled={loading} className="mt-2 w-full">
          <Icon name="user" size={15} />
          {loading ? 'Бүртгэж байна…' : 'Бүртгүүлэх'}
        </Button>
      </form>
    </Form>
  );
};

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

const signInSchema = z.object({
  email: z.string().email('Имэйл хаяг буруу байна.'),
  password: z.string().min(1, 'Нууц үгээ оруулна уу.'),
});

type SignInValues = z.infer<typeof signInSchema>;

export const SignInForm = ({ next }: { next?: string | null }) => {
  const router = useRouter();
  const client = useApolloClient();
  const { signIn } = useSession();
  const [login, { loading }] = useMutation<LoginResponse>(AUTH_PORTAL_LOGIN);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async ({ email, password }: SignInValues) => {
    const address = email.trim();

    try {
      const { data } = await login({
        variables: { email: address, password },
      });

      /*
       * Depending on the portal's delivery method the token either comes back
       * here or was just set as a cookie. The follow-up read has to carry it
       * explicitly, because it is not in storage yet.
       */
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
        throw new Error('Нэвтэрсэн хэрэглэгчийн мэдээлэл ирсэнгүй.');
      }

      signIn(sessionFromCurrentUser(current, address), token);

      toast({
        variant: 'success',
        title: 'Амжилттай нэвтэрлээ',
        description: `Тавтай морил, ${displayName(current)}.`,
      });

      /*
       * Replaced rather than pushed, so going back from the guarded route the
       * visitor was after does not land them on the sign-in form again.
       */
      router.replace(next ?? '/');
    } catch (caught) {
      const message = authErrorMessage(caught);

      form.setError('root', { message });
      toast({
        variant: 'destructive',
        title: 'Нэвтэрч чадсангүй',
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

        <Button type="submit" disabled={loading} className="mt-2 w-full">
          <Icon name="lock" size={15} />
          {loading ? 'Нэвтэрч байна…' : 'Нэвтрэх'}
        </Button>
      </form>
    </Form>
  );
};

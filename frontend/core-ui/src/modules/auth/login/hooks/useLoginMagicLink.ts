import { SubmitHandler, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  LOGIN_WITH_GOOGLE,
  LOGIN_WITH_MAGIC_LINK,
} from '@/auth/login/grahpql/mutations/login';
import { useApolloClient, useMutation } from '@apollo/client';
import { FormType, toast } from 'erxes-ui';
import {
  magicLinkFormSchema,
  MagicLinkFormType,
} from '@/auth/login/definitions/magicLinkFormDefinitions';

export const useLoginMagicLink = () => {
  const [loginWithGoogle] = useMutation(LOGIN_WITH_GOOGLE);
  const [loginWithMagicLink] = useMutation(LOGIN_WITH_MAGIC_LINK);
  const { resetStore } = useApolloClient();

  const form = useForm<MagicLinkFormType>({
    resolver: zodResolver(magicLinkFormSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onChange',
  });

  const onMagicLinkSubmit: SubmitHandler<MagicLinkFormType> = ({
    email,
  }: MagicLinkFormType) => {
    loginWithMagicLink({
      variables: { email },
      onCompleted: () => {
        toast({
          title: 'We have sent an email containing the magic link to sign in.',
        });
        resetStore();
      },
      onError: ({ message }) => {
        const isInvalidLogin = message.includes('Invalid login');
        const toastData = {
          title: 'Something went wrong',
          description: message,
        };

        if (isInvalidLogin) {
          toastData.title = 'Invalid login';
          toastData.description =
            'The email address or password you entered is incorrect.';
        }
        toast(toastData);
      },
    });
  };

  const onGoogleLogin = () =>
    loginWithGoogle({
      onCompleted: (data) => {
        if (data && data.loginWithGoogle) {
          try {
            const url = new URL(data.loginWithGoogle);
            if (url.protocol === 'https:' || url.protocol === 'http:') {
              window.location.href = data.loginWithGoogle;
            } else {
              throw new Error('Invalid URL protocol');
            }
          } catch (error) {
            toast({
              title: 'Something went wrong',
              description: 'Invalid redirect URL received',
            });
          }
        }
      },
      onError: ({ message }) => {
        toast({ title: 'Something went wrong', description: message });
      },
    });

  return {
    form,
    onMagicLinkSubmit: form.handleSubmit(onMagicLinkSubmit),
    onGoogleLogin,
  };
};

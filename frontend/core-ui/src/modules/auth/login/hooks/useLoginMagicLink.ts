import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  LOGIN_WITH_GOOGLE,
  LOGIN_WITH_MAGIC_LINK,
} from '@/auth/login/grahpql/mutations/login';
import { useApolloClient, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import {
  magicLinkFormSchema,
  MagicLinkFormType,
} from '@/auth/login/definitions/magicLinkFormDefinitions';
import { useTranslation } from 'react-i18next';

export const useLoginMagicLink = () => {
  const { t } = useTranslation('auth');
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
          title: t('magic-link-sent', 'We have sent an email containing the magic link to sign in.'),
        });
        resetStore();
      },
      onError: ({ message }) => {
        const isInvalidLogin = message.includes('Invalid login');
        toast({
          title: isInvalidLogin ? t('invalid-login', 'Invalid login') : t('something-went-wrong', 'Something went wrong'),
          description: isInvalidLogin
            ? t('invalid-login-description', 'The email address or password you entered is incorrect.')
            : message,
          variant: 'destructive',
        });
      },
    });
  };

  const onGoogleLogin = () =>
    loginWithGoogle({
      onCompleted: (data) => {
        if (data?.loginWithGoogle) {
          try {
            const url = new URL(data.loginWithGoogle);
            if (url.protocol === 'https:' || url.protocol === 'http:') {
              window.location.href = data.loginWithGoogle;
            } else {
              throw new Error('Invalid URL protocol');
            }
          } catch (error) {
            toast({
              title: t('something-went-wrong', 'Something went wrong'),
              description: t('invalid-redirect-url', 'Invalid redirect URL received'),
              variant: 'destructive',
            });
          }
        }
      },
      onError: ({ message }) => {
        toast({
          title: t('something-went-wrong', 'Something went wrong'),
          description: message,
          variant: 'destructive',
        });
      },
    });

  return {
    form,
    onMagicLinkSubmit: form.handleSubmit(onMagicLinkSubmit),
    onGoogleLogin,
  };
};

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Dialog, Form, Input, Spinner, useToast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { messageOf } from '~/lib/api';
import { RESET_PASSWORD_QUERY_KEY } from '../constants';
import { useTeamMemberSetPassword } from '../useTeamMembers';

/** Old `USER_RESET_PASSWORD_SCHEMA` (the API checks the same rules). */
const USER_RESET_PASSWORD_SCHEMA = z
  .object({
    newPassword: z
      .string()
      .refine((val) => /.{8,}/.test(val), { message: 'At least 8 characters' })
      .refine((val) => /[0-9]/.test(val), { message: 'At least 1 number' })
      .refine((val) => /[a-z]/.test(val), { message: 'At least 1 lowercase letter' })
      .refine((val) => /[A-Z]/.test(val), { message: 'At least 1 uppercase letter' }),
    repeatPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.repeatPassword, {
    message: 'Passwords must match',
    path: ['repeatPassword'],
  });

type TResetPasswordForm = z.infer<typeof USER_RESET_PASSWORD_SCHEMA>;

/** A manager sets another member's password (`?reset_password_id=`); someone invited can then sign in. */
export const ResetPasswordDialog = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const userId = searchParams.get(RESET_PASSWORD_QUERY_KEY);
  const setPassword = useTeamMemberSetPassword();

  const form = useForm<TResetPasswordForm>({
    mode: 'onBlur',
    defaultValues: { newPassword: '', repeatPassword: '' },
    resolver: zodResolver(USER_RESET_PASSWORD_SCHEMA),
  });

  const { control, handleSubmit, reset, watch } = form;
  const [newPassword, repeatPassword] = watch(['newPassword', 'repeatPassword']);

  const close = () =>
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);

      next.delete(RESET_PASSWORD_QUERY_KEY);

      return next;
    });

  const onSubmit = (data: TResetPasswordForm) => {
    if (!userId) return;

    setPassword.mutate(
      { id: userId, password: data.newPassword },
      {
        onError: (error) => toast({ title: messageOf(error), variant: 'destructive' }),
        onSuccess: () => {
          toast({ title: t('password-changed'), variant: 'success' });
          reset();
          close();
        },
      },
    );
  };

  return (
    <Dialog open={!!userId} onOpenChange={(open) => !open && close()}>
      <Dialog.Content>
        <Dialog.HeaderCombined
          title={t('reset-password-title')}
          description={t('set-new-password')}
        />
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="flex flex-col gap-3 mb-3">
              <Form.Field
                control={control}
                name="newPassword"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('new-password')}</Form.Label>
                    <Form.Control>
                      <Input
                        type="password"
                        {...field}
                        placeholder={t('new-password')}
                        autoComplete="new-password"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={control}
                name="repeatPassword"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('retype-password')}</Form.Label>
                    <Form.Control>
                      <Input
                        type="password"
                        {...field}
                        placeholder={t('retype-password')}
                        autoComplete="new-password"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </fieldset>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={
                  setPassword.isPending ||
                  newPassword.trim() === '' ||
                  repeatPassword.trim() === '' ||
                  newPassword !== repeatPassword
                }
              >
                {setPassword.isPending ? <Spinner /> : t('save')}
              </Button>
            </div>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
};

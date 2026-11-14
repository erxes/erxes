import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Dialog, Form, Input, Spinner, useToast } from 'erxes-ui';
import { useForm, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { messageOf } from '@erxes/core-contract/client';
import { RESET_PASSWORD_QUERY_KEY } from '../constants';
import { useTeamMemberSetPassword } from '../useTeamMembers';

/** The API checks the same rules. */
const USER_RESET_PASSWORD_SCHEMA = z
  .object({
    newPassword: z
      .string()
      .refine((val) => /.{8,}/.test(val), {
        error: 'At least 8 characters',
      })
      .refine((val) => /[0-9]/.test(val), {
        error: 'At least 1 number',
      })
      .refine((val) => /[a-z]/.test(val), {
        error: 'At least 1 lowercase letter',
      })
      .refine((val) => /[A-Z]/.test(val), {
        error: 'At least 1 uppercase letter',
      }),
    repeatPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.repeatPassword, {
    path: ['repeatPassword'],
    error: 'Passwords must match',
  });

type TResetPasswordForm = z.infer<typeof USER_RESET_PASSWORD_SCHEMA>;

const PasswordField = ({ name, label }: { name: keyof TResetPasswordForm; label: string }) => {
  const { control } = useFormContext<TResetPasswordForm>();

  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{label}</Form.Label>
          <Form.Control>
            <Input type="password" {...field} placeholder={label} autoComplete="new-password" />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

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

  const { control, handleSubmit, reset } = form;

  const [newPassword, repeatPassword] = useWatch({
    control,
    name: ['newPassword', 'repeatPassword'],
  });

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
          <form onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
            <fieldset className="flex flex-col gap-3 mb-3">
              <PasswordField name="newPassword" label={t('new-password')} />
              <PasswordField name="repeatPassword" label={t('retype-password')} />
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

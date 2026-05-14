import { PasswordInput } from '@/settings/security/components/fields/password-field';
import PasswordStrength from '@/settings/security/components/PasswordStrength';
import { useChangePassword } from '@/settings/security/hooks/useChangePassword';
import { useChangePasswordForm } from '@/settings/security/hooks/useChangePasswordForm';
import { IChangePassword } from '@/settings/security/types';
import { Button, Form, Spinner, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const ChangePasswordForm = () => {
  const { form } = useChangePasswordForm();
  const { changePassword, loading } = useChangePassword();
  const { control, watch, handleSubmit, reset, formState } = form;
  const { errors } = formState;

  const [newPassword, reTypeValue, currentPassword] = watch([
    'newPassword',
    'reTypeNewPassword',
    'currentPassword',
  ]);
  const { t } = useTranslation('settings', { keyPrefix: 'change-password' });
  const onSubmit = (data: IChangePassword) => {
    const { currentPassword, newPassword } = data;
    changePassword({
      variables: {
        currentPassword,
        newPassword,
      },
      onCompleted: () => {
        toast({
          title: 'Password has changed successfully',
          variant: 'success',
        });
        reset();
      },
      onError: (error) =>
        toast({
          title: 'Error changing password',
          description: error.message,
          variant: 'destructive',
        }),
    });
  };

  return (
    <Form {...form}>
      <form
        className="mx-auto max-w-md w-full h-auto my-3 flex flex-col"
        onSubmit={handleSubmit(onSubmit)}
      >
        <fieldset className="flex flex-col space-y-4">
          <legend className="font-semibold text-lg pt-4 pb-6">{t('_')}</legend>
          <Form.Field
            control={control}
            name="currentPassword"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('current-password')}</Form.Label>
                <Form.Control>
                  <PasswordInput
                    {...field}
                    placeholder={t('current-password')}
                    autoComplete={field.name}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={control}
            name="newPassword"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('new-password')}</Form.Label>
                <Form.Control>
                  <PasswordInput
                    {...field}
                    placeholder={t('new-password')}
                    autoComplete={field.name}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
          <Form.Field
            control={control}
            name="reTypeNewPassword"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('confirm-password')}</Form.Label>
                <Form.Control>
                  <PasswordInput
                    {...field}
                    placeholder={t('confirm-password')}
                    autoComplete={field.name}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
          <PasswordStrength
            value={newPassword}
            reTypeValue={reTypeValue}
            errors={errors || {}}
          />
        </fieldset>
        <div className="mt-6 flex justify-end">
          <Button
            type="submit"
            disabled={
              loading ||
              currentPassword.trim() === '' ||
              newPassword.trim() === '' ||
              reTypeValue.trim() === '' ||
              newPassword !== reTypeValue
            }
          >
            {loading ? <Spinner /> : t('save')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

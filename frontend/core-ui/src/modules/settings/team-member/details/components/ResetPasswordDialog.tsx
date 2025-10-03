import { useUserResetPassword } from '@/settings/team-member/hooks/useUserResetPassword';
import { USER_RESET_PASSWORD_SCHEMA } from '@/settings/team-member/schema/users';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Dialog,
  Form,
  Input,
  Spinner,
  toast,
  usePreviousHotkeyScope,
  useQueryState,
} from 'erxes-ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type TResetPasswordForm = z.infer<typeof USER_RESET_PASSWORD_SCHEMA>;

export const ResetPasswordDialog = () => {
  const { resetPassword, loading } = useUserResetPassword();
  const [open, setOpen] = useQueryState<string>('reset_password_id');
  const { goBackToPreviousHotkeyScope } = usePreviousHotkeyScope();
  const form = useForm<TResetPasswordForm>({
    mode: 'onBlur',
    defaultValues: {
      newPassword: '',
      repeatPassword: '',
    },
    resolver: zodResolver(USER_RESET_PASSWORD_SCHEMA),
  });

  const { control, handleSubmit, reset, watch } = form;
  const [newPassword, repeatPassword] = watch([
    'newPassword',
    'repeatPassword',
  ]);

  const onSubmit = (data: TResetPasswordForm) => {
    const { newPassword, repeatPassword } = data;
    if (repeatPassword === newPassword) {
      resetPassword({
        variables: {
          _id: open,
          newPassword,
        },
        onError: (error) =>
          toast({ title: error.message, variant: 'destructive' }),
        onCompleted: () => {
          toast({ title: "This user's password has been changed" });
          reset();
          setOpen(null);
          goBackToPreviousHotkeyScope();
        },
      });
    }
  };

  return (
    <Dialog
      open={!!open}
      onOpenChange={() => {
        setOpen(null);
        goBackToPreviousHotkeyScope();
      }}
    >
      <Dialog.Content>
        <Dialog.HeaderCombined
          title="Reset password"
          description="Set new password for the user"
        />
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="flex flex-col gap-3 mb-3">
              <Form.Field
                control={control}
                name="newPassword"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>New password</Form.Label>
                    <Form.Control>
                      <Input
                        type={'password'}
                        {...field}
                        placeholder="New password"
                        autoComplete={'new-password'}
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
                    <Form.Label>Re-type password</Form.Label>
                    <Form.Control>
                      <Input
                        type={'password'}
                        {...field}
                        placeholder="Re-type password"
                        autoComplete={'new-password webauthn'}
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
                  loading ||
                  newPassword.trim() === '' ||
                  repeatPassword.trim() === '' ||
                  newPassword !== repeatPassword
                }
              >
                {loading ? <Spinner /> : 'Save'}
              </Button>
            </div>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
};

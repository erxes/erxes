import { CP_USERS_SET_PASSWORD } from '@/contacts/client-portal-users/graphql/cpUsersSetPassword';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Dialog,
  Form,
  Input,
  Spinner,
  toast,
} from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useMutation } from '@apollo/client';

const CP_USER_SET_PASSWORD_SCHEMA = z
  .object({
    newPassword: z
      .string()
      .refine((val) => /.{8,}/.test(val), {
        message: 'At least 8 characters',
      })
      .refine((val) => /[0-9]/.test(val), { message: 'At least 1 number' })
      .refine((val) => /[a-z]/.test(val), {
        message: 'At least 1 lowercase letter',
      })
      .refine((val) => /[A-Z]/.test(val), {
        message: 'At least 1 uppercase letter',
      }),
    repeatPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.repeatPassword, {
    message: 'Passwords must match',
    path: ['repeatPassword'],
  });

type CPUserSetPasswordForm = z.infer<typeof CP_USER_SET_PASSWORD_SCHEMA>;

interface CPUserSetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cpUserId: string;
}

export function CPUserSetPasswordDialog({
  open,
  onOpenChange,
  cpUserId,
}: CPUserSetPasswordDialogProps) {
  const { t } = useTranslation('contact', {
    keyPrefix: 'clientPortalUser.setPassword',
  });
  const [cpUsersSetPassword, { loading }] = useMutation(CP_USERS_SET_PASSWORD);

  const form = useForm<CPUserSetPasswordForm>({
    mode: 'onBlur',
    defaultValues: {
      newPassword: '',
      repeatPassword: '',
    },
    resolver: zodResolver(CP_USER_SET_PASSWORD_SCHEMA),
  });

  const { control, handleSubmit, reset, watch } = form;
  const [newPassword, repeatPassword] = watch(['newPassword', 'repeatPassword']);

  const onSubmit = (data: CPUserSetPasswordForm) => {
    cpUsersSetPassword({
      variables: {
        _id: cpUserId,
        newPassword: data.newPassword,
      },
      onError: (error) =>
        toast({ title: error.message, variant: 'destructive' }),
      onCompleted: () => {
        toast({
          title: t('success', {
            defaultValue: "This user's password has been changed",
          }),
          variant: 'success',
        });
        reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.HeaderCombined
          title={t('title', { defaultValue: 'Set password' })}
          description={t('description', {
            defaultValue: 'Set new password for the client portal user',
          })}
        />
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="flex flex-col gap-3 mb-3">
              <Form.Field
                control={control}
                name="newPassword"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      {t('newPassword', { defaultValue: 'New password' })}
                    </Form.Label>
                    <Form.Control>
                      <Input
                        type="password"
                        {...field}
                        placeholder={t('newPasswordPlaceholder', {
                          defaultValue: 'New password',
                        })}
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
                    <Form.Label>
                      {t('repeatPassword', {
                        defaultValue: 'Re-type password',
                      })}
                    </Form.Label>
                    <Form.Control>
                      <Input
                        type="password"
                        {...field}
                        placeholder={t('repeatPasswordPlaceholder', {
                          defaultValue: 'Re-type password',
                        })}
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
                  loading ||
                  newPassword.trim() === '' ||
                  repeatPassword.trim() === '' ||
                  newPassword !== repeatPassword
                }
              >
                {loading ? <Spinner /> : t('save', { defaultValue: 'Save' })}
              </Button>
            </div>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
}

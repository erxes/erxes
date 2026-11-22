import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Dialog, Form, Input, Spinner, useToast } from 'erxes-ui';
import type { TFunction } from 'i18next';
import { useForm, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { messageOf } from '@erxes/core-contract/client';
import { useTeamMemberSetPassword } from '../useTeamMembers';

type T = TFunction<'workspace', 'team-member'>;

/** The API checks the same rules. */
const resetPasswordSchema = (t: T) =>
  z
    .object({
      newPassword: z
        .string()
        .refine((val) => /.{8,}/.test(val), { error: t('password-min', 'At least 8 characters') })
        .refine((val) => /[0-9]/.test(val), { error: t('password-number', 'Add a number') })
        .refine((val) => /[a-z]/.test(val), {
          error: t('password-lowercase', 'Add a lowercase letter'),
        })
        .refine((val) => /[A-Z]/.test(val), {
          error: t('password-uppercase', 'Add an uppercase letter'),
        }),
      repeatPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.repeatPassword, {
      path: ['repeatPassword'],
      error: t('password-mismatch', 'The passwords do not match'),
    });

type TResetPasswordForm = z.infer<ReturnType<typeof resetPasswordSchema>>;

const PasswordField = ({
  name,
  label,
  hint,
}: {
  name: keyof TResetPasswordForm;
  label: string;
  hint?: string;
}) => {
  const { control } = useFormContext<TResetPasswordForm>();

  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label required>{label}</Form.Label>
          <Form.Control>
            <Input type="password" {...field} autoComplete="new-password" />
          </Form.Control>
          {hint && <Form.Description>{hint}</Form.Description>}
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

/** A manager sets another member's password; someone invited can then sign in. */
export const ResetPasswordDialog = ({
  userId,
  onClose,
}: {
  /** The member whose password is being set; none: closed. */
  userId: string | null;
  onClose: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { toast } = useToast();
  const setPassword = useTeamMemberSetPassword();

  const form = useForm<TResetPasswordForm>({
    mode: 'onTouched',
    defaultValues: { newPassword: '', repeatPassword: '' },
    resolver: zodResolver(resetPasswordSchema(t)),
  });

  const { handleSubmit, reset } = form;

  const close = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: TResetPasswordForm) => {
    if (!userId) return;

    setPassword.mutate(
      { id: userId, password: data.newPassword },
      {
        onError: (error) => toast({ title: messageOf(error), variant: 'destructive' }),
        onSuccess: () => {
          toast({ title: t('password-changed'), variant: 'success' });
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
          <form
            onSubmit={(event) => void handleSubmit(onSubmit)(event)}
            className="flex flex-col gap-4"
            noValidate
          >
            <PasswordField
              name="newPassword"
              label={t('new-password')}
              hint={t('password-hint', '8 or more characters, with A–Z, a–z and 0–9')}
            />
            <PasswordField name="repeatPassword" label={t('retype-password')} />
            <Dialog.Footer>
              <Button
                type="button"
                variant="outline"
                onClick={close}
                disabled={setPassword.isPending}
              >
                {t('cancel', 'Cancel')}
              </Button>
              <Button type="submit" disabled={setPassword.isPending}>
                {setPassword.isPending && <Spinner size="sm" />}
                {t('save')}
              </Button>
            </Dialog.Footer>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
};

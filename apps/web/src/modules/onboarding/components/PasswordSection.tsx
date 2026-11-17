import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Button, Form, Input, Spinner, useToast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { useSessionQuery } from '~/modules/auth/session';
import { ONBOARDING_NS } from '../i18n';
import { Appear, EASE_OUT_QUAD } from './Appear';

/** The API's own rule (`NewPassword`), checked here first. */
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,200}$/;

const getPasswordSchema = (t: (key: string) => string) =>
  z
    .object({ password: z.string().regex(PASSWORD_RULE, t('password-rule')), confirm: z.string() })
    .refine((values) => values.confirm === values.password, {
      error: t('password-mismatch'),
      path: ['confirm'],
    });

type PasswordValues = z.infer<ReturnType<typeof getPasswordSchema>>;

const PasswordField = ({
  name,
  label,
  hint,
}: {
  name: keyof PasswordValues;
  label: string;
  /** What the password must have, under it until it has an error. */
  hint?: string;
}) => (
  <Form.Field
    name={name}
    render={({ field, fieldState }) => (
      <Form.Item>
        <Form.Label required>{label}</Form.Label>
        <Form.Control>
          <Input {...field} type="password" autoComplete="new-password" />
        </Form.Control>
        {hint && !fieldState.error && <Form.Description>{hint}</Form.Description>}
        <Form.Message />
      </Form.Item>
    )}
  />
);

/**
 * For a member without a password (a SaaS owner, signed in from erxes.io):
 * the one they will also sign in with at this workspace's own address.
 */
export const PasswordSection = ({ onContinue }: { onContinue: () => void }) => {
  const { t } = useTranslation('common', { keyPrefix: 'onboarding' });
  const { t: tOnboarding } = useTranslation(ONBOARDING_NS);
  const { toast } = useToast();
  const { refetch } = useSessionQuery();

  const form = useForm<PasswordValues>({
    resolver: zodResolver(getPasswordSchema(tOnboarding)),
    defaultValues: { password: '', confirm: '' },
  });

  const save = useMutation(
    orpc.auth.changePassword.mutationOptions({
      // The fresh session has the password, so the step leaves the list.
      onSuccess: async () => {
        await refetch();
        onContinue();
      },
      onError: (error) =>
        toast({
          title: tOnboarding('password-failed'),
          description: messageOf(error),
          variant: 'destructive',
        }),
    }),
  );

  return (
    <Appear
      y={50}
      duration={600}
      easing={EASE_OUT_QUAD}
      className="grid gap-5 shadow-sm px-5 pt-7 pb-10 rounded-2xl bg-background h-fit max-sm:mx-2 sm:min-w-md"
    >
      <Appear y={20} duration={500} delay={200} className="flex flex-col gap-2 text-center mb-2">
        <h2 className="text-2xl font-semibold text-foreground">{tOnboarding('password-title')}</h2>
        <p className="text-sm text-muted-foreground">
          {tOnboarding('password-description', { host: window.location.host })}
        </p>
      </Appear>
      <Appear y={20} duration={400} delay={300}>
        <Form {...form}>
          <form
            noValidate
            onSubmit={(event) =>
              void form.handleSubmit(({ password }) => save.mutate({ newPassword: password }))(
                event,
              )
            }
            className="grid gap-3"
          >
            <PasswordField
              name="password"
              label={t('password')}
              hint={tOnboarding('password-hint')}
            />
            <PasswordField name="confirm" label={t('confirm-password')} />
            <Button
              type="submit"
              className="w-full cursor-pointer"
              size="lg"
              disabled={save.isPending}
            >
              {save.isPending && <Spinner size="sm" />}
              {t('continue')}
            </Button>
          </form>
        </Form>
      </Appear>
    </Appear>
  );
};

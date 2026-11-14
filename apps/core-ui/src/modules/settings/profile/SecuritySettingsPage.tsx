import { IconCircleCheck, IconCircleX, IconKey, IconLock } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Form,
  Input,
  PageContainer,
  PageHeader,
  RelativeDateDisplay,
  ScrollArea,
  Spinner,
  useToast,
} from 'erxes-ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { isApiError, messageOf, orpc } from '~/lib/api';
import { useSignOutEverywhere } from '~/modules/auth/session';
import { Section } from './Section';
import { TwoFactorSection } from './TwoFactorSection';

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,200}$/;

const usePasswordSchema = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });

  return z
    .object({
      currentPassword: z.string().min(1, t('required', 'Required')),
      newPassword: z
        .string()
        .regex(
          PASSWORD_RULE,
          t(
            'password-rule',
            'At least 8 characters with a lower-case letter, an upper-case letter and a digit',
          ),
        ),
      confirm: z.string(),
    })
    .refine((values) => values.confirm === values.newPassword, {
      error: t('password-mismatch', 'The passwords differ'),
      path: ['confirm'],
    });
};

type PasswordValues = z.infer<ReturnType<typeof usePasswordSchema>>;

const PasswordField = ({
  name,
  label,
  autoComplete,
}: {
  name: keyof PasswordValues;
  label: string;
  autoComplete: string;
}) => (
  <Form.Field
    name={name}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>{label}</Form.Label>
        <Form.Control>
          <Input {...field} type="password" autoComplete={autoComplete} />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);

/** Changing my own password needs the current one. */
const PasswordForm = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });
  const { toast } = useToast();

  const form = useForm<PasswordValues>({
    resolver: zodResolver(usePasswordSchema()),
    defaultValues: { currentPassword: '', newPassword: '', confirm: '' },
  });

  const change = useMutation(
    orpc.auth.changePassword.mutationOptions({
      onSuccess: () => {
        form.reset();
        toast({ title: t('password-changed', 'Password changed') });
      },
      onError: (error) => {
        if (isApiError(error, 'WRONG_PASSWORD'))
          form.setError('currentPassword', { message: error.message });
        else if (isApiError(error, 'SAME_PASSWORD'))
          form.setError('newPassword', { message: error.message });
        else
          toast({
            variant: 'destructive',
            title: t('password-failed', 'Could not change the password'),
            description: messageOf(error),
          });
      },
    }),
  );

  return (
    <Section
      title={t('password', 'Password')}
      description={t('password-description', 'Use a password you don’t use elsewhere.')}
    >
      <Form {...form}>
        <form
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          onSubmit={(event) =>
            void form.handleSubmit(({ currentPassword, newPassword }) =>
              change.mutate({ currentPassword, newPassword }),
            )(event)
          }
        >
          <PasswordField
            name="currentPassword"
            label={t('current-password', 'Current password')}
            autoComplete="current-password"
          />
          <PasswordField
            name="newPassword"
            label={t('new-password', 'New password')}
            autoComplete="new-password"
          />
          <PasswordField
            name="confirm"
            label={t('confirm-password', 'Repeat new password')}
            autoComplete="new-password"
          />
          <div className="sm:col-span-3">
            <Button type="submit" variant="outline" disabled={change.isPending}>
              {change.isPending ? <Spinner size="sm" /> : <IconKey />}
              {t('change-password', 'Change password')}
            </Button>
          </div>
        </form>
      </Form>
    </Section>
  );
};

/** "Chrome on macOS" from a user agent, enough to recognise a device. */
const deviceOf = (agent: string | null) => {
  if (!agent) return '—';

  const browser = /Edg\//.test(agent)
    ? 'Edge'
    : /Chrome\//.test(agent)
      ? 'Chrome'
      : /Firefox\//.test(agent)
        ? 'Firefox'
        : /Safari\//.test(agent)
          ? 'Safari'
          : (agent.split(' ')[0] ?? agent);

  const system = /Mac OS X/.test(agent)
    ? 'macOS'
    : /Windows/.test(agent)
      ? 'Windows'
      : /Android/.test(agent)
        ? 'Android'
        : /iPhone|iPad/.test(agent)
          ? 'iOS'
          : /Linux/.test(agent)
            ? 'Linux'
            : '';

  return system ? `${browser} · ${system}` : browser;
};

/** Where and when I signed in; a failed attempt I don't recognise is worth a password change. */
const SignIns = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });

  const signIns = useQuery(orpc.auth.signIns.queryOptions());

  return (
    <Section
      title={t('sign-ins', 'Recent sign-ins')}
      description={t('sign-ins-description', 'If you don’t recognise one, change your password.')}
    >
      <QueryState
        query={signIns}
        className="py-6"
        isEmpty={({ data }) => !data.length}
        empty={
          <p className="text-sm text-muted-foreground">
            {t('no-sign-ins', 'No sign-ins recorded yet.')}
          </p>
        }
      >
        {({ data }) => (
          <ul className="divide-y text-sm">
            {data.map((entry) => (
              <li key={entry.id} className="flex items-center gap-3 py-2">
                {entry.success ? (
                  <IconCircleCheck className="size-4 text-green-600" />
                ) : (
                  <IconCircleX className="size-4 text-destructive" />
                )}
                <span className="flex-1">{deviceOf(entry.userAgent)}</span>
                <span className="text-muted-foreground">{entry.ip ?? '—'}</span>
                {!entry.success && <Badge variant="destructive">{t('failed', 'Failed')}</Badge>}
                <RelativeDateDisplay
                  value={entry.createdAt}
                  render={<span className="w-28 text-right text-muted-foreground" />}
                >
                  <RelativeDateDisplay.Value value={entry.createdAt} />
                </RelativeDateDisplay>
              </li>
            ))}
          </ul>
        )}
      </QueryState>
      <SignOutEverywhere />
    </Section>
  );
};

/** Ends every session on every device, this one too (a lost laptop, a shared computer). */
const SignOutEverywhere = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });
  const run = useSignOutEverywhere();

  return (
    <div className="mt-4 flex items-center justify-between gap-4 rounded-md border p-3">
      <p className="text-sm text-muted-foreground">
        {t(
          'sign-out-everywhere-description',
          'Lost a device or signed in on a shared computer? End every session, this one included.',
        )}
      </p>
      <Button variant="outline" disabled={run.isPending} onClick={() => run.mutate()}>
        {t('sign-out-everywhere', 'Sign out of all devices')}
      </Button>
    </div>
  );
};

/** Settings › Password & security: the member's password, two-step sign-in and where they are signed in. */
export const SecuritySettingsPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              {
                label: t('security-title', 'Password & security'),
                to: '/settings/security',
                icon: IconLock,
              },
            ]}
          />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
          <PasswordForm />
          <section className="rounded-lg border bg-background p-5">
            <TwoFactorSection />
          </section>
          <SignIns />
        </div>
      </ScrollArea>
    </PageContainer>
  );
};

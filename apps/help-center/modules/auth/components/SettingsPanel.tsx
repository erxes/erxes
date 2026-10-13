'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from 'erxes-ui/components/form';
import { toast } from 'erxes-ui/hooks/use-toast';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Badge } from '@/modules/ui/components/Badge';
import { Button } from '@/modules/ui/components/Button';
import { PasswordInput } from '@/modules/ui/components/FormInput';
import { Icon, type IconName } from '@/modules/ui/components/Icon';
import { cn } from '@/modules/ui/lib/cn';
import { AUTH_PORTAL_CHANGE_PASSWORD } from '../graphql/mutations/auth';
import { AUTH_PORTAL_CURRENT_USER } from '../graphql/queries/auth';
import {
  displayName,
  type ChangePasswordResponse,
  type CurrentUser,
  type CurrentUserResponse,
} from '../types';
import { formatDateTime } from '@/modules/i18n/format';
import { useLocale, useT } from '@/modules/i18n/components/LocaleProvider';
import type { MessageKey, Translate } from '@/modules/i18n/translate';
import { authErrorMessage } from '../utils/errors';
import { PASSWORD_RULE } from '../utils/password';
import {
  AccountAside,
  accountColumns,
  accountPanelEnter,
  accountShell,
} from './AccountAside';
import { AccountLoadError, AccountPanelSkeleton } from './AccountStates';

const labelClass = 'text-[13px] font-medium text-ink';

const SIGN_IN_METHODS: Record<string, MessageKey> = {
  EMAIL: 'settings.methodEmail',
  PHONE: 'settings.methodPhone',
  SOCIAL: 'settings.methodSocial',
};

const CardHeader = ({
  icon,
  title,
  description,
}: {
  icon: IconName;
  title: string;
  description: string;
}) => (
  <div className="flex items-start gap-3.5 border-b border-line px-6 py-5">
    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
      <Icon name={icon} size={19} />
    </span>
    <div className="min-w-0">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  </div>
);

const passwordSchema = (t: Translate) =>
  z
    .object({
      currentPassword: z.string().min(1, t('validation.currentPassword')),
      newPassword: z.string().regex(PASSWORD_RULE, t('auth.passwordHint')),
      confirm: z.string(),
    })
    .refine((values) => values.confirm === values.newPassword, {
      message: t('validation.passwordMatch'),
      path: ['confirm'],
    })
    .refine((values) => values.currentPassword !== values.newPassword, {
      message: t('validation.passwordSame'),
      path: ['newPassword'],
    });

type PasswordValues = z.infer<ReturnType<typeof passwordSchema>>;

const EMPTY_PASSWORD: PasswordValues = {
  currentPassword: '',
  newPassword: '',
  confirm: '',
};

const PasswordCard = () => {
  const t = useT();
  const [changePassword, { loading }] = useMutation<ChangePasswordResponse>(
    AUTH_PORTAL_CHANGE_PASSWORD,
  );

  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema(t)),
    defaultValues: EMPTY_PASSWORD,
  });

  const onSubmit = async (values: PasswordValues) => {
    try {
      const { data } = await changePassword({
        variables: {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
      });

      if (!data?.clientPortalUserChangePassword) {
        throw new Error(t('settings.passwordNotChanged'));
      }

      form.reset(EMPTY_PASSWORD);

      toast({
        variant: 'success',
        title: t('settings.passwordChanged'),
        description: t('settings.passwordChangedText'),
      });
    } catch (caught) {
      const message = authErrorMessage(caught, t);

      form.setError('root', { message });
      toast({
        variant: 'destructive',
        title: t('settings.passwordFailed'),
        description: message,
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className={accountShell}
      >
        <CardHeader
          icon="lock"
          title={t('settings.passwordTitle')}
          description={t('settings.passwordText')}
        />

        <div className="space-y-5 px-6 py-6">
          <Form.Field
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <Form.Item>
                <Form.Label className={labelClass} variant="peer">
                  {t('field.currentPassword')}
                </Form.Label>
                <Form.Control>
                  <PasswordInput
                    {...field}
                    autoComplete="current-password"
                    placeholder="••••••••"
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
            <Form.Field
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className={labelClass} variant="peer">
                    {t('field.newPassword')}
                  </Form.Label>
                  <Form.Control>
                    <PasswordInput
                      {...field}
                      autoComplete="new-password"
                      placeholder="••••••••"
                    />
                  </Form.Control>
                  <Form.Description>
                    At least 8 characters, with an uppercase letter, a lowercase
                    letter and a number.
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="confirm"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className={labelClass} variant="peer">
                    {t('field.confirmNewPassword')}
                  </Form.Label>
                  <Form.Control>
                    <PasswordInput
                      {...field}
                      autoComplete="new-password"
                      placeholder="••••••••"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>

          {form.formState.errors.root ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl bg-danger-soft px-3.5 py-2.5 text-[13px] leading-relaxed text-danger"
            >
              <Icon name="alert" size={15} className="mt-px shrink-0" />
              {form.formState.errors.root.message}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end border-t border-line bg-subtle/60 px-6 py-4">
          <Button
            type="submit"
            disabled={loading || !form.formState.isDirty}
            className="min-w-28"
          >
            <Icon name="check" size={15} />
            {loading ? t('common.saving') : t('settings.changePassword')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

const Detail = ({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: { tone: 'success' | 'warning'; text: string };
}) => (
  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 py-3.5">
    <span className="text-[13px] text-muted-foreground">{label}</span>
    <span className="flex min-w-0 items-center gap-2">
      <span className="truncate text-sm font-medium text-ink">{value}</span>
      {badge ? (
        <Badge tone={badge.tone}>
          <Icon
            name={badge.tone === 'success' ? 'check' : 'alert'}
            size={12}
            className="mr-1"
          />
          {badge.text}
        </Badge>
      ) : null}
    </span>
  </div>
);

const SignInCard = ({ user }: { user: CurrentUser }) => {
  const t = useT();
  const locale = useLocale();
  const verified = { tone: 'success' as const, text: t('account.verified') };
  const unverified = {
    tone: 'warning' as const,
    text: t('settings.unverified'),
  };
  const method = user.primaryAuthMethod
    ? SIGN_IN_METHODS[user.primaryAuthMethod]
    : undefined;
  const [editedBefore, editedAfter] = t('settings.editedOn').split('{link}');

  return (
    <section className={accountShell}>
      <CardHeader
        icon="settings"
        title={t('settings.securityTitle')}
        description={t('settings.securityText')}
      />

      <div className="divide-y divide-line px-6 py-2">
        <Detail
          label={t('field.email')}
          value={user.email ?? t('settings.notAdded')}
          badge={
            user.email
              ? user.isEmailVerified
                ? verified
                : unverified
              : undefined
          }
        />
        <Detail
          label={t('field.phone')}
          value={user.phone ?? t('settings.notAdded')}
          badge={
            user.phone
              ? user.isPhoneVerified
                ? verified
                : unverified
              : undefined
          }
        />
        <Detail
          label={t('settings.method')}
          value={t(method ?? 'settings.methodEmail')}
        />
        <Detail
          label={t('settings.lastSignIn')}
          value={
            user.lastLoginAt
              ? formatDateTime(user.lastLoginAt, locale)
              : t('settings.notRecorded')
          }
        />
      </div>

      <p className="border-t border-line bg-subtle/60 px-6 py-4 text-xs leading-relaxed text-muted-foreground">
        {editedBefore}
        <Link
          href="/account"
          className="font-semibold text-brand underline-offset-2 hover:underline"
        >
          {t('settings.profilePage')}
        </Link>
        {editedAfter}
      </p>
    </section>
  );
};

export const SettingsPanel = () => {
  const { data, loading, error } = useQuery<CurrentUserResponse>(
    AUTH_PORTAL_CURRENT_USER,
    { errorPolicy: 'all' },
  );

  const current = data?.clientPortalCurrentUser ?? null;

  if (loading && !current) {
    return <AccountPanelSkeleton />;
  }

  if (!current) {
    return <AccountLoadError message={error?.message} />;
  }

  return (
    <div className={accountColumns}>
      <AccountAside
        name={displayName(current)}
        email={current.email ?? ''}
        isVerified={current.isVerified}
        avatar={current.avatar}
      />

      <div className={cn('space-y-6', accountPanelEnter)}>
        <PasswordCard />
        <SignInCard user={current} />
      </div>
    </div>
  );
};

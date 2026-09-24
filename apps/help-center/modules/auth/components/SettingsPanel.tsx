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
import { AUTH_PORTAL_CHANGE_PASSWORD } from '../graphql/mutations/auth';
import { AUTH_PORTAL_CURRENT_USER } from '../graphql/queries/auth';
import {
  displayName,
  type ChangePasswordResponse,
  type CurrentUser,
  type CurrentUserResponse,
} from '../types';
import { authErrorMessage } from '../utils/errors';
import { PASSWORD_HINT, PASSWORD_RULE } from '../utils/password';
import { AccountAside, accountColumns, accountShell } from './AccountAside';
import { AccountLoadError, AccountPanelSkeleton } from './AccountStates';

const labelClass = 'text-[13px] font-medium text-ink';

const SIGN_IN_METHODS: Record<string, string> = {
  EMAIL: 'Email and password',
  PHONE: 'Phone number',
  SOCIAL: 'A connected social account',
};

const formatSignIn = (value: string | null): string => {
  if (!value) {
    return 'Not recorded yet';
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? 'Not recorded yet'
    : date.toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
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

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password.'),
    newPassword: z.string().regex(PASSWORD_RULE, PASSWORD_HINT),
    confirm: z.string(),
  })
  .refine((values) => values.confirm === values.newPassword, {
    message: 'The passwords do not match.',
    path: ['confirm'],
  })
  .refine((values) => values.currentPassword !== values.newPassword, {
    message: 'The new password must be different from the current one.',
    path: ['newPassword'],
  });

type PasswordValues = z.infer<typeof passwordSchema>;

const EMPTY_PASSWORD: PasswordValues = {
  currentPassword: '',
  newPassword: '',
  confirm: '',
};

const PasswordCard = () => {
  const [changePassword, { loading }] = useMutation<ChangePasswordResponse>(
    AUTH_PORTAL_CHANGE_PASSWORD,
  );

  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
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
        throw new Error('Your password was not changed.');
      }

      form.reset(EMPTY_PASSWORD);

      toast({
        variant: 'success',
        title: 'Your password was changed',
        description: 'Use the new password the next time you sign in.',
      });
    } catch (caught) {
      const message = authErrorMessage(caught);

      form.setError('root', { message });
      toast({
        variant: 'destructive',
        title: 'Could not change your password',
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
          title="Password"
          description="Change the password you use to sign in to this portal."
        />

        <div className="space-y-5 px-6 py-6">
          <Form.Field
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <Form.Item>
                <Form.Label className={labelClass} variant="peer">
                  Current password
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
                    New password
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
                    Confirm new password
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
            {loading ? 'Saving…' : 'Change password'}
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

const SignInCard = ({ user }: { user: CurrentUser }) => (
  <section className={accountShell}>
    <CardHeader
      icon="settings"
      title="Sign-in and security"
      description="How you reach this portal and the state of your account."
    />

    <div className="divide-y divide-line px-6 py-2">
      <Detail
        label="Email"
        value={user.email ?? 'Not added'}
        badge={
          user.email
            ? user.isEmailVerified
              ? { tone: 'success', text: 'Verified' }
              : { tone: 'warning', text: 'Unverified' }
            : undefined
        }
      />
      <Detail
        label="Phone"
        value={user.phone ?? 'Not added'}
        badge={
          user.phone
            ? user.isPhoneVerified
              ? { tone: 'success', text: 'Verified' }
              : { tone: 'warning', text: 'Unverified' }
            : undefined
        }
      />
      <Detail
        label="Sign-in method"
        value={
          (user.primaryAuthMethod && SIGN_IN_METHODS[user.primaryAuthMethod]) ??
          'Email and password'
        }
      />
      <Detail label="Last sign-in" value={formatSignIn(user.lastLoginAt)} />
    </div>

    <p className="border-t border-line bg-subtle/60 px-6 py-4 text-xs leading-relaxed text-muted-foreground">
      Your email, phone number and name are edited on the{' '}
      <Link
        href="/account"
        className="font-semibold text-brand underline-offset-2 hover:underline"
      >
        profile page
      </Link>
      .
    </p>
  </section>
);

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

      <div className="space-y-6">
        <PasswordCard />
        <SignInCard user={current} />
      </div>
    </div>
  );
};

import { USER_LINK_NAMES, type User, type UserLinkName } from '@erxes/core-contract';
import {
  IconBrandDiscord,
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandX,
  IconCircleCheck,
  IconCircleX,
  IconDeviceFloppy,
  IconKey,
  IconUserCircle,
  IconWorld,
  type Icon,
} from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Form,
  Input,
  PageContainer,
  RelativeDateDisplay,
  ScrollArea,
  Spinner,
  Textarea,
  Upload,
  useToast,
} from 'erxes-ui';
import { type ReactNode, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageHeader } from 'ui-modules';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { api, isApiError, messageOf } from '~/lib/api';
import { SESSION_KEY, useSession, useSignOut } from '~/modules/auth/session';
import { TwoFactorSection } from './TwoFactorSection';

const LINK_ICONS: Record<UserLinkName, Icon> = {
  facebook: IconBrandFacebook,
  twitter: IconBrandX,
  website: IconWorld,
  discord: IconBrandDiscord,
  github: IconBrandGithub,
  instagram: IconBrandInstagram,
};

const TEXT_FIELDS = [
  'firstName',
  'middleName',
  'lastName',
  'shortName',
  'username',
  'email',
  'phone',
  'employeeId',
  'birthDate',
  'workStartedDate',
  'description',
] as const;
type TextField = (typeof TEXT_FIELDS)[number];

type ProfileValues = Record<TextField, string> & { avatarUrl: string; links: Record<UserLinkName, string> };

const valuesOf = (user: User): ProfileValues => ({
  ...(Object.fromEntries(TEXT_FIELDS.map((field) => [field, user[field] ?? ''])) as Record<TextField, string>),
  avatarUrl: user.avatarUrl ?? '',
  links: Object.fromEntries(USER_LINK_NAMES.map((name) => [name, user.links[name] ?? ''])) as Record<UserLinkName, string>,
});

/** Only what changed; an emptied field clears it (`null`). */
const patchOf = (before: ProfileValues, after: ProfileValues) => {
  const patch: Record<string, unknown> = {};

  for (const field of [...TEXT_FIELDS, 'avatarUrl'] as const) {
    const value = after[field].trim();

    if (value !== before[field].trim()) {
      // Username and email can't be emptied, only changed.
      patch[field] = value || (field === 'username' || field === 'email' ? undefined : null);
    }
  }

  const links: Record<string, string | null> = {};

  for (const name of USER_LINK_NAMES) {
    const value = after.links[name].trim();

    if (value !== before.links[name].trim()) links[name] = value || null;
  }

  if (Object.keys(links).length) patch.links = links;

  return Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined));
};

const Section = ({ title, description, children }: { title: string; description?: string; children: ReactNode }) => (
  <section className="space-y-4 rounded-lg border bg-background p-5">
    <div>
      <h2 className="text-base font-semibold">{title}</h2>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
    {children}
  </section>
);

const TextInput = ({
  name,
  label,
  placeholder,
  type = 'text',
  disabled,
}: {
  name: TextField | `links.${UserLinkName}`;
  label: ReactNode;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) => (
  <Form.Field
    name={name}
    render={({ field }) => (
      <Form.Item>
        <Form.Label className="text-xs">{label}</Form.Label>
        <Form.Control>
          <Input {...field} value={field.value ?? ''} type={type} placeholder={placeholder} disabled={disabled} />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);

/** Picture, names, contact details, about and links: what teammates see. */
const ProfileForm = ({ user }: { user: User }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });
  const client = useQueryClient();
  const { toast } = useToast();
  const form = useForm<ProfileValues>({ defaultValues: valuesOf(user) });

  useEffect(() => form.reset(valuesOf(user)), [user, form]);

  const save = useMutation({
    mutationFn: (patch: Record<string, unknown>) =>
      api.users.update({ id: user.id, ...patch } as Parameters<typeof api.users.update>[0]),
    onSuccess: (saved) => {
      form.reset(valuesOf(saved));
      void client.invalidateQueries({ queryKey: SESSION_KEY });
      void client.invalidateQueries({ queryKey: ['users'] });
      toast({ title: t('saved', 'Profile saved') });
    },
    onError: (error) => {
      if (isApiError(error, 'EMAIL_TAKEN')) form.setError('email', { message: error.message });
      if (isApiError(error, 'USERNAME_TAKEN')) form.setError('username', { message: error.message });

      const issues = isApiError(error, 'INVALID_INPUT')
        ? ((error.data as { issues?: { path: (string | number)[]; message: string }[] })?.issues ?? [])
        : [];

      issues.forEach((issue) => form.setError(issue.path.join('.') as keyof ProfileValues, { message: issue.message }));
      toast({ variant: 'destructive', title: t('save-failed', 'Could not save your profile'), description: messageOf(error) });
    },
  });

  const submit = form.handleSubmit((values) => {
    const patch = patchOf(valuesOf(user), values);

    if (!Object.keys(patch).length) {
      toast({ title: t('no-changes', 'Nothing to save') });
      return;
    }

    save.mutate(patch);
  });

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4" onSubmit={submit}>
        <Section title={t('picture', 'Profile picture')} description={t('picture-description', 'Shown next to your name across erxes.')}>
          <Form.Field
            name="avatarUrl"
            render={({ field }) => (
              <Upload.Root
                value={field.value ?? ''}
                onChange={(fileInfo) => field.onChange(fileInfo && 'url' in fileInfo ? fileInfo.url : '')}
              >
                <Upload.Preview />
                <div className="flex gap-2">
                  <Upload.Button size="sm" variant="outline" type="button" />
                  <Upload.RemoveButton size="sm" variant="outline" type="button" />
                </div>
              </Upload.Root>
            )}
          />
        </Section>
        <Section title={t('basic', 'Basic information')}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TextInput name="firstName" label={t('first-name', 'First name')} />
            <TextInput name="middleName" label={t('middle-name', 'Middle name')} />
            <TextInput name="lastName" label={t('last-name', 'Last name')} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput name="shortName" label={t('short-name', 'Short name')} />
            <TextInput name="username" label={t('username', 'Username')} placeholder="bold.bat" />
            <TextInput name="email" type="email" label={t('email', 'Email (you sign in with it)')} />
            <TextInput name="phone" type="tel" label={t('phone', 'Phone')} placeholder="+976 9911 2233" />
          </div>
        </Section>
        <Section title={t('more', 'More information')}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TextInput name="employeeId" label={t('employee-id', 'Employee ID')} />
            <TextInput name="birthDate" type="date" label={t('birth-date', 'Birth date')} />
            <TextInput name="workStartedDate" type="date" label={t('work-started', 'Started work')} />
          </div>
          <Form.Field
            name="description"
            render={({ field }) => (
              <Form.Item>
                <Form.Label className="text-xs">{t('about', 'About me')}</Form.Label>
                <Form.Control>
                  <Textarea {...field} rows={4} placeholder={t('about-placeholder', 'A few words for your teammates')} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </Section>
        <Section title={t('links', 'Links')}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {USER_LINK_NAMES.map((name) => {
              const LinkIcon = LINK_ICONS[name];

              return (
                <TextInput
                  key={name}
                  name={`links.${name}`}
                  label={
                    <span className="flex items-center gap-1.5 capitalize">
                      <LinkIcon className="size-3.5" />
                      {name === 'twitter' ? 'X (Twitter)' : name}
                    </span>
                  }
                  placeholder="https://"
                />
              );
            })}
          </div>
        </Section>
        <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-background/95 py-3 backdrop-blur">
          <Button type="button" variant="ghost" disabled={!form.formState.isDirty} onClick={() => form.reset(valuesOf(user))}>
            {t('discard', 'Discard')}
          </Button>
          <Button type="submit" disabled={save.isPending || !form.formState.isDirty}>
            {save.isPending ? <Spinner size="sm" /> : <IconDeviceFloppy />}
            {t('save', 'Save profile')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

interface PasswordValues {
  currentPassword: string;
  newPassword: string;
  confirm: string;
}

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,200}$/;

/** Changing my own password needs the current one. */
const PasswordForm = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });
  const { toast } = useToast();
  const form = useForm<PasswordValues>({ defaultValues: { currentPassword: '', newPassword: '', confirm: '' } });
  const change = useMutation({
    mutationFn: (values: PasswordValues) =>
      api.auth.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword }),
    onSuccess: () => {
      form.reset();
      toast({ title: t('password-changed', 'Password changed') });
    },
    onError: (error) => {
      if (isApiError(error, 'WRONG_PASSWORD')) form.setError('currentPassword', { message: error.message });
      else if (isApiError(error, 'SAME_PASSWORD')) form.setError('newPassword', { message: error.message });
      else toast({ variant: 'destructive', title: t('password-failed', 'Could not change the password'), description: messageOf(error) });
    },
  });

  const field = (name: keyof PasswordValues, label: string, autoComplete: string) => (
    <Form.Field
      name={name}
      rules={
        name === 'currentPassword'
          ? { required: t('required', 'Required') }
          : name === 'newPassword'
            ? {
                pattern: {
                  value: PASSWORD_RULE,
                  message: t('password-rule', 'At least 8 characters with a lower-case letter, an upper-case letter and a digit'),
                },
              }
            : { validate: (value: string) => value === form.getValues('newPassword') || t('password-mismatch', 'The passwords differ') }
      }
      render={({ field: input }) => (
        <Form.Item>
          <Form.Label className="text-xs">{label}</Form.Label>
          <Form.Control>
            <Input {...input} type="password" autoComplete={autoComplete} />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );

  return (
    <Section title={t('password', 'Password')} description={t('password-description', 'Use a password you don’t use elsewhere.')}>
      <Form {...form}>
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-3" onSubmit={form.handleSubmit((values) => change.mutate(values))}>
          {field('currentPassword', t('current-password', 'Current password'), 'current-password')}
          {field('newPassword', t('new-password', 'New password'), 'new-password')}
          {field('confirm', t('confirm-password', 'Repeat new password'), 'new-password')}
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
          : agent.split(' ')[0];
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
  const { data, isPending } = useQuery({ queryKey: ['auth', 'sign-ins'], queryFn: () => api.auth.signIns() });

  return (
    <Section title={t('sign-ins', 'Recent sign-ins')} description={t('sign-ins-description', 'If you don’t recognise one, change your password.')}>
      {isPending ? (
        <Spinner containerClassName="py-6" />
      ) : !data?.data.length ? (
        <p className="text-sm text-muted-foreground">{t('no-sign-ins', 'No sign-ins recorded yet.')}</p>
      ) : (
        <ul className="divide-y text-sm">
          {data.data.map((entry) => (
            <li key={entry.id} className="flex items-center gap-3 py-2">
              {entry.success ? (
                <IconCircleCheck className="size-4 text-green-600" />
              ) : (
                <IconCircleX className="size-4 text-destructive" />
              )}
              <span className="flex-1">{deviceOf(entry.userAgent)}</span>
              <span className="text-muted-foreground">{entry.ip ?? '—'}</span>
              {!entry.success && (
                <Badge variant="destructive" className="font-normal">
                  {t('failed', 'Failed')}
                </Badge>
              )}
              <RelativeDateDisplay value={entry.createdAt} asChild>
                <span className="w-28 text-right text-muted-foreground">
                  <RelativeDateDisplay.Value value={entry.createdAt} />
                </span>
              </RelativeDateDisplay>
            </li>
          ))}
        </ul>
      )}
      <SignOutEverywhere />
    </Section>
  );
};

/** Ends every session on every device, this one too (a lost laptop, a shared computer). */
const SignOutEverywhere = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });
  const { toast } = useToast();
  const signOut = useSignOut();
  const run = useMutation({
    mutationFn: () => signOut({ everywhere: true }),
    onError: (error) => toast({ variant: 'destructive', title: t('sign-out-everywhere-failed', 'Could not sign out'), description: messageOf(error) }),
  });

  return (
    <div className="mt-4 flex items-center justify-between gap-4 rounded-md border p-3">
      <p className="text-sm text-muted-foreground">
        {t('sign-out-everywhere-description', 'Lost a device or signed in on a shared computer? End every session, this one included.')}
      </p>
      <Button variant="outline" disabled={run.isPending} onClick={() => run.mutate()}>
        {t('sign-out-everywhere', 'Sign out of all devices')}
      </Button>
    </div>
  );
};

/** Settings › Profile: the signed-in member's own details, password and sign-ins. */
export const ProfileSettingsPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });
  const { user } = useSession();
  const { data: profile } = useQuery({
    queryKey: ['users', 'detail', user.id],
    queryFn: () => api.users.get({ id: user.id }),
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb items={[{ label: t('title', 'Profile'), to: '/settings/profile', icon: IconUserCircle }]} />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
          {profile ? <ProfileForm user={profile} /> : <Spinner containerClassName="py-12" />}
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

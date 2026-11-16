import { USER_LINK_NAMES, type User, type UserLinkName } from '@erxes/core-contract';
import {
  IconBrandDiscord,
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandX,
  IconWorld,
  type Icon,
} from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DatePicker, Form, Input, Textarea, toIsoDay, Upload, useToast } from 'erxes-ui';
import type { ReactNode } from 'react';
import { type RegisterOptions, type UseFormReturn, useForm, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { isApiError, messageOf, orpc } from '@erxes/core-contract/client';
import { PROFILE_FIELDS, type ProfileValues, patchOf, valuesOf } from './profileValues';

const LINK_ICONS: Record<UserLinkName, Icon> = {
  facebook: IconBrandFacebook,
  twitter: IconBrandX,
  website: IconWorld,
  discord: IconBrandDiscord,
  github: IconBrandGithub,
  instagram: IconBrandInstagram,
};

// The shape the API checks; it has the final say.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type TextName = Exclude<keyof ProfileValues, 'avatarUrl' | 'links'> | `links.${UserLinkName}`;

const TextInput = ({
  name,
  label,
  placeholder,
  type = 'text',
  autoComplete,
  rules,
}: {
  name: TextName;
  label: ReactNode;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'url';
  autoComplete?: string;
  /** A field the profile can't be saved without, and what it must look like. */
  rules?: RegisterOptions<ProfileValues, TextName>;
}) => {
  const { control } = useFormContext<ProfileValues>();

  return (
    <Form.Field
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <Form.Item>
          <Form.Label required={Boolean(rules?.required)}>{label}</Form.Label>
          <Form.Control>
            <Input
              {...field}
              value={field.value ?? ''}
              type={type}
              autoComplete={autoComplete}
              placeholder={placeholder}
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

/** A day (`2024-03-01`), picked from a calendar or typed. */
const DayInput = ({ name, label }: { name: 'birthDate' | 'workStartedDate'; label: string }) => {
  const { control } = useFormContext<ProfileValues>();

  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{label}</Form.Label>
          <Form.Control>
            <DatePicker
              value={field.value || undefined}
              placeholder="YYYY/MM/DD"
              onChange={(date) => field.onChange(date instanceof Date ? toIsoDay(date) : '')}
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

const useSaveProfile = (user: User, form: UseFormReturn<ProfileValues>) => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation(
    orpc.users.update.mutationOptions({
      onSuccess: (saved) => {
        form.reset(valuesOf(saved));
        client.setQueryData(orpc.users.get.queryKey({ input: { id: user.id } }), saved);
        void client.invalidateQueries({ queryKey: orpc.auth.me.key() });
        void client.invalidateQueries({ queryKey: orpc.users.key() });
        toast({ title: t('saved', 'Profile saved') });
      },
      onError: (error) => {
        if (isApiError(error, 'TAKEN')) form.setError('email', { message: error.message });

        for (const issue of isApiError(error, 'INVALID_INPUT') ? error.data.issues : []) {
          const path = issue.path.join('.');
          const field = PROFILE_FIELDS.find((name) => name === path);

          if (field) form.setError(field, { message: issue.message });
        }

        toast({
          variant: 'destructive',
          title: t('save-failed', 'Could not save your profile'),
          description: messageOf(error),
        });
      },
    }),
  );
};

const PictureSection = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });
  const { control } = useFormContext<ProfileValues>();

  return (
    <Form.Section
      title={t('picture', 'Profile picture')}
      description={t('picture-description', 'Shown next to your name across erxes.')}
    >
      <Form.Field
        control={control}
        name="avatarUrl"
        render={({ field }) => (
          <Upload.Root
            value={field.value ?? ''}
            onChange={(fileInfo) =>
              field.onChange(fileInfo && 'url' in fileInfo ? fileInfo.url : '')
            }
          >
            <Upload.Preview />
            <div className="flex gap-2">
              <Upload.Button size="sm" variant="outline" type="button" />
              <Upload.RemoveButton size="sm" variant="outline" type="button" />
            </div>
          </Upload.Root>
        )}
      />
    </Form.Section>
  );
};

const BasicSection = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });

  return (
    <Form.Section
      title={t('basic', 'Basic information')}
      description={t('basic-description', 'How teammates see and reach you.')}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TextInput
          name="firstName"
          label={t('first-name', 'First name')}
          autoComplete="given-name"
        />
        <TextInput
          name="middleName"
          label={t('middle-name', 'Middle name')}
          autoComplete="additional-name"
        />
        <TextInput name="lastName" label={t('last-name', 'Last name')} autoComplete="family-name" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextInput name="shortName" label={t('short-name', 'Short name')} autoComplete="nickname" />
        <TextInput
          name="username"
          label={t('username', 'Username')}
          placeholder="bold.bat"
          autoComplete="username"
          rules={{ required: t('username-required', 'Enter a username') }}
        />
        <TextInput
          name="email"
          type="email"
          label={t('email', 'Email (you sign in with it)')}
          autoComplete="email"
          rules={{
            required: t('email-required', 'Enter your email'),
            pattern: {
              value: EMAIL,
              message: t('email-invalid', 'Enter an email like name@example.com'),
            },
          }}
        />
        <TextInput
          name="phone"
          type="tel"
          label={t('phone', 'Phone')}
          placeholder="+976 9911 2233"
          autoComplete="tel"
        />
      </div>
    </Form.Section>
  );
};

const MoreSection = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });

  return (
    <Form.Section title={t('more', 'More information')}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DayInput name="birthDate" label={t('birth-date', 'Birth date')} />
        <DayInput name="workStartedDate" label={t('work-started', 'Started work')} />
      </div>
      <Form.Field
        name="description"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('about', 'About me')}</Form.Label>
            <Form.Control>
              <Textarea
                {...field}
                rows={4}
                placeholder={t('about-placeholder', 'A few words for your teammates')}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </Form.Section>
  );
};

const LinksSection = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });

  return (
    <Form.Section title={t('links', 'Links')}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {USER_LINK_NAMES.map((name) => {
          const LinkIcon = LINK_ICONS[name];

          return (
            <TextInput
              key={name}
              name={`links.${name}`}
              type="url"
              label={
                <span className="flex items-center gap-1.5 capitalize">
                  <LinkIcon className="size-3.5" aria-hidden="true" />
                  {name === 'twitter' ? 'X (Twitter)' : name}
                </span>
              }
              placeholder="https://"
            />
          );
        })}
      </div>
    </Form.Section>
  );
};

/** Picture, names, contact details, about and links: what teammates see. */
export const ProfileForm = ({ user }: { user: User }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });
  const form = useForm<ProfileValues>({ defaultValues: valuesOf(user) });
  const save = useSaveProfile(user, form);

  const submit = form.handleSubmit((values) => {
    const patch = patchOf(valuesOf(user), values);

    // The bar's Save is off until something changed; typing a value back counts as no change.
    if (!Object.keys(patch).length) {
      form.reset(values);

      return;
    }

    save.mutate({ id: user.id, ...patch });
  });

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4" noValidate onSubmit={(event) => void submit(event)}>
        <PictureSection />
        <BasicSection />
        <MoreSection />
        <LinksSection />
        <Form.SaveBar saving={save.isPending} saveLabel={t('save', 'Save profile')} />
      </form>
    </Form>
  );
};

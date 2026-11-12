import { USER_LINK_NAMES, type User, type UserLinkName } from '@erxes/core-contract';
import {
  IconBrandDiscord,
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandX,
  IconDeviceFloppy,
  IconWorld,
  type Icon,
} from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, Spinner, Textarea, Upload, useToast } from 'erxes-ui';
import type { ReactNode } from 'react';
import { type UseFormReturn, useForm, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { errorData, isApiError, messageOf, orpc } from '~/lib/api';
import { PROFILE_FIELDS, type ProfileValues, patchOf, valuesOf } from './profileValues';
import { Section } from './Section';

const LINK_ICONS: Record<UserLinkName, Icon> = {
  facebook: IconBrandFacebook,
  twitter: IconBrandX,
  website: IconWorld,
  discord: IconBrandDiscord,
  github: IconBrandGithub,
  instagram: IconBrandInstagram,
};

const invalidInput = z.object({
  issues: z.array(
    z.object({ path: z.array(z.union([z.string(), z.number()])), message: z.string() }),
  ),
});

const TextInput = ({
  name,
  label,
  placeholder,
  type = 'text',
}: {
  name: Exclude<keyof ProfileValues, 'avatarUrl' | 'links'> | `links.${UserLinkName}`;
  label: ReactNode;
  placeholder?: string;
  type?: string;
}) => {
  const { control } = useFormContext<ProfileValues>();

  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label className="text-xs">{label}</Form.Label>
          <Form.Control>
            <Input {...field} value={field.value ?? ''} type={type} placeholder={placeholder} />
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
        if (isApiError(error, 'EMAIL_TAKEN')) form.setError('email', { message: error.message });

        if (isApiError(error, 'USERNAME_TAKEN'))
          form.setError('username', { message: error.message });

        for (const issue of errorData(error, invalidInput)?.issues ?? []) {
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
    <Section
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
    </Section>
  );
};

const BasicSection = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });

  return (
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
        <TextInput
          name="phone"
          type="tel"
          label={t('phone', 'Phone')}
          placeholder="+976 9911 2233"
        />
      </div>
    </Section>
  );
};

const MoreSection = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });

  return (
    <Section title={t('more', 'More information')}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextInput name="birthDate" type="date" label={t('birth-date', 'Birth date')} />
        <TextInput name="workStartedDate" type="date" label={t('work-started', 'Started work')} />
      </div>
      <Form.Field
        name="description"
        render={({ field }) => (
          <Form.Item>
            <Form.Label className="text-xs">{t('about', 'About me')}</Form.Label>
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
    </Section>
  );
};

const LinksSection = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });

  return (
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
  );
};

/** Picture, names, contact details, about and links: what teammates see. */
export const ProfileForm = ({ user }: { user: User }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });
  const { toast } = useToast();
  const form = useForm<ProfileValues>({ defaultValues: valuesOf(user) });
  const save = useSaveProfile(user, form);

  const submit = form.handleSubmit((values) => {
    const patch = patchOf(valuesOf(user), values);

    if (!Object.keys(patch).length) {
      toast({ title: t('no-changes', 'Nothing to save') });

      return;
    }

    save.mutate({ id: user.id, ...patch });
  });

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4" onSubmit={(event) => void submit(event)}>
        <PictureSection />
        <BasicSection />
        <MoreSection />
        <LinksSection />
        <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-background/95 py-3 backdrop-blur">
          <Button
            type="button"
            variant="ghost"
            disabled={!form.formState.isDirty}
            onClick={() => form.reset(valuesOf(user))}
          >
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

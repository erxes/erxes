'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from 'erxes-ui/components/form';
import { toast } from 'erxes-ui/hooks/use-toast';
import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { readApiUrl } from '@/modules/apollo/utils/env';
import { Button } from '@/modules/ui/components/Button';
import { TextInput } from '@/modules/ui/components/FormInput';
import { Icon } from '@/modules/ui/components/Icon';
import { cn } from '@/modules/ui/lib/cn';
import { AUTH_PORTAL_USER_EDIT } from '../graphql/mutations/auth';
import { AUTH_PORTAL_CURRENT_USER } from '../graphql/queries/auth';
import {
  displayName,
  sessionFromCurrentUser,
  type CurrentUser,
  type CurrentUserResponse,
  type UserEditResponse,
} from '../types';
import { AVATAR_ACCEPT, uploadAvatar } from '../utils/avatar';
import { useT } from '@/modules/i18n/components/LocaleProvider';
import type { Translate } from '@/modules/i18n/translate';
import { profileErrorMessage } from '../utils/errors';
import {
  AccountAside,
  accountColumns,
  accountPanelEnter,
  accountShell,
} from './AccountAside';
import { AccountLoadError, AccountPanelSkeleton } from './AccountStates';
import { useSession } from './SessionProvider';

const PHONE_MIN_DIGITS = 8;

const digitsOf = (value: string) => value.replace(/\D/g, '');

const profileSchema = (t: Translate) =>
  z.object({
    firstName: z.string().max(100, t('validation.firstNameLong')),
    lastName: z.string().max(100, t('validation.lastNameLong')),
    username: z.string().max(100, t('validation.usernameLong')),
    email: z.string().email(t('validation.email')),
    phone: z
      .string()
      .refine(
        (value) => !value.trim() || digitsOf(value).length >= PHONE_MIN_DIGITS,
        {
          message: t('validation.phoneDigits', { count: PHONE_MIN_DIGITS }),
        },
      ),
    companyName: z.string().max(200, t('validation.companyLong')),
    avatar: z.string(),
  });

type ProfileValues = z.infer<ReturnType<typeof profileSchema>>;

const EMPTY: ProfileValues = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  phone: '',
  companyName: '',
  avatar: '',
};

const valuesOf = (user: CurrentUser): ProfileValues => ({
  firstName: user.firstName ?? '',
  lastName: user.lastName ?? '',
  username: user.username ?? '',
  email: user.email ?? '',
  phone: user.phone ?? '',
  companyName: user.companyName ?? '',
  avatar: user.avatar ?? '',
});

const labelClass = 'text-[13px] font-medium text-ink';

export const ProfileForm = () => {
  const apiUrl = readApiUrl();
  const t = useT();
  const { updateUser } = useSession();
  const picker = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data, loading, error } = useQuery<CurrentUserResponse>(
    AUTH_PORTAL_CURRENT_USER,
    { errorPolicy: 'all' },
  );

  const [editUser, { loading: saving }] = useMutation<UserEditResponse>(
    AUTH_PORTAL_USER_EDIT,
  );

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema(t)),
    defaultValues: EMPTY,
  });

  const [avatar, firstName, lastName] = useWatch({
    control: form.control,
    name: ['avatar', 'firstName', 'lastName'],
  });

  const current = data?.clientPortalCurrentUser ?? null;
  const { reset } = form;

  const stored = current ? JSON.stringify(valuesOf(current)) : '';

  useEffect(() => {
    if (stored) {
      reset(JSON.parse(stored) as ProfileValues);
    }
  }, [stored, reset]);

  if (loading && !current) {
    return <AccountPanelSkeleton />;
  }

  if (!current) {
    return <AccountLoadError message={error?.message} />;
  }

  const previewName = displayName({
    ...current,
    firstName: firstName || null,
    lastName: lastName || null,
  });

  const pickAvatar = async (picked: FileList | null) => {
    const file = picked?.[0];

    if (!file) {
      return;
    }

    setUploading(true);

    try {
      const url = await uploadAvatar(file, apiUrl, t);

      form.setValue('avatar', url, { shouldDirty: true });
    } catch (caught) {
      toast({
        variant: 'destructive',
        title: t('profile.uploadFailed'),
        description:
          caught instanceof Error
            ? caught.message
            : t('profile.uploadFailedText'),
      });
    } finally {
      setUploading(false);

      if (picker.current) {
        picker.current.value = '';
      }
    }
  };

  const onSubmit = async (values: ProfileValues) => {
    try {
      const { data: saved } = await editUser({
        variables: {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          username: values.username.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          avatar: values.avatar,
          companyName: values.companyName.trim(),
        },
      });

      const updated = saved?.clientPortalUserEdit;

      if (!updated) {
        throw new Error(t('profile.notSaved'));
      }

      updateUser({
        ...sessionFromCurrentUser(updated, values.email.trim()),
        avatar: updated.avatar ?? undefined,
      });

      toast({
        variant: 'success',
        title: t('profile.saved'),
        description: t('profile.savedText'),
      });
    } catch (caught) {
      const message = profileErrorMessage(caught, t);

      form.setError('root', { message });
      toast({
        variant: 'destructive',
        title: t('profile.saveFailed'),
        description: message,
      });
    }
  };

  const busy = saving || uploading;
  const dirty = form.formState.isDirty;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className={accountColumns}
      >
        <AccountAside
          name={previewName}
          email={current.email ?? ''}
          isVerified={current.isVerified}
          avatar={avatar}
          uploading={uploading}
          busy={busy}
          onPickAvatar={() => picker.current?.click()}
          onRemoveAvatar={() =>
            form.setValue('avatar', '', { shouldDirty: true })
          }
        />

        <input
          ref={picker}
          type="file"
          accept={AVATAR_ACCEPT}
          className="hidden"
          onChange={(event) => void pickAvatar(event.target.files)}
        />

        <div className={cn(accountShell, accountPanelEnter, 'flex flex-col')}>
          <div className="flex items-start gap-3.5 border-b border-line px-6 py-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <Icon name="user" size={19} />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-ink">
                {t('profile.title')}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {t('profile.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-5 px-6 py-6">
            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
              <Form.Field
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label className={labelClass} variant="peer">
                      {t('field.firstName')}
                    </Form.Label>
                    <Form.Control>
                      <TextInput
                        {...field}
                        autoComplete="given-name"
                        placeholder={t('field.firstNamePlaceholder')}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label className={labelClass} variant="peer">
                      {t('field.lastName')}
                    </Form.Label>
                    <Form.Control>
                      <TextInput
                        {...field}
                        autoComplete="family-name"
                        placeholder={t('field.lastNamePlaceholder')}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="username"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label className={labelClass} variant="peer">
                      {t('field.username')}
                    </Form.Label>
                    <Form.Control>
                      <TextInput
                        {...field}
                        autoComplete="username"
                        placeholder={t('field.usernamePlaceholder')}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="email"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label className={labelClass} variant="peer">
                      {t('field.email')} <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control>
                      <TextInput
                        {...field}
                        type="email"
                        autoComplete="email"
                        placeholder="name@example.com"
                      />
                    </Form.Control>
                    <Form.Description>{t('field.emailHint')}</Form.Description>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label className={labelClass} variant="peer">
                      {t('field.phone')}
                    </Form.Label>
                    <Form.Control>
                      <TextInput
                        {...field}
                        type="tel"
                        autoComplete="tel"
                        placeholder="99112233"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label className={labelClass} variant="peer">
                      {t('field.company')}
                    </Form.Label>
                    <Form.Control>
                      <TextInput
                        {...field}
                        autoComplete="organization"
                        placeholder={t('field.companyPlaceholder')}
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
                className="flex items-start gap-2 rounded-lg bg-danger-soft px-3.5 py-2.5 text-[13px] leading-relaxed text-danger"
              >
                <Icon name="alert" size={15} className="mt-px shrink-0" />
                {form.formState.errors.root.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-subtle/60 px-6 py-4">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon
                name={dirty ? 'alarm' : 'check'}
                size={14}
                className={dirty ? 'text-warning' : 'text-success'}
              />
              {dirty ? t('profile.unsaved') : t('profile.allSaved')}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                disabled={busy || !dirty}
                onClick={() => reset(valuesOf(current))}
              >
                {t('common.discard')}
              </Button>
              <Button
                type="submit"
                disabled={busy || !dirty}
                className="min-w-28"
              >
                <Icon name="check" size={15} />
                {saving ? t('common.saving') : t('common.saveChanges')}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};

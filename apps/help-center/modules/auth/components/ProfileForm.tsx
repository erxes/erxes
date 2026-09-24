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
import { profileErrorMessage } from '../utils/errors';
import { AccountAside, accountColumns, accountShell } from './AccountAside';
import { AccountLoadError, AccountPanelSkeleton } from './AccountStates';
import { useSession } from './SessionProvider';

const PHONE_MIN_DIGITS = 8;

const digitsOf = (value: string) => value.replace(/\D/g, '');

const profileSchema = z.object({
  firstName: z.string().max(100, 'The first name is too long.'),
  lastName: z.string().max(100, 'The last name is too long.'),
  username: z.string().max(100, 'The user name is too long.'),
  email: z.string().email('That email address is not valid.'),
  phone: z
    .string()
    .refine(
      (value) => !value.trim() || digitsOf(value).length >= PHONE_MIN_DIGITS,
      {
        message: `The phone number must have at least ${PHONE_MIN_DIGITS} digits.`,
      },
    ),
  companyName: z.string().max(200, 'The company name is too long.'),
  avatar: z.string(),
});

type ProfileValues = z.infer<typeof profileSchema>;

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
    resolver: zodResolver(profileSchema),
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
      const url = await uploadAvatar(file, apiUrl);

      form.setValue('avatar', url, { shouldDirty: true });
    } catch (caught) {
      toast({
        variant: 'destructive',
        title: 'Could not upload the picture',
        description:
          caught instanceof Error
            ? caught.message
            : 'Could not upload the picture.',
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
        throw new Error('Your details were not saved.');
      }

      updateUser({
        ...sessionFromCurrentUser(updated, values.email.trim()),
        avatar: updated.avatar ?? undefined,
      });

      toast({
        variant: 'success',
        title: 'Your profile was saved',
        description: 'Your details are now up to date.',
      });
    } catch (caught) {
      const message = profileErrorMessage(caught);

      form.setError('root', { message });
      toast({
        variant: 'destructive',
        title: 'Could not save your profile',
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

        <div className={accountShell}>
          <div className="flex items-start gap-3.5 border-b border-line px-6 py-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <Icon name="user" size={19} />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-ink">User profile</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                These details are shown to the support team on every ticket you
                raise.
              </p>
            </div>
          </div>

          <div className="space-y-5 px-6 py-6">
            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
              <Form.Field
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label className={labelClass} variant="peer">
                      First name
                    </Form.Label>
                    <Form.Control>
                      <TextInput
                        {...field}
                        autoComplete="given-name"
                        placeholder="Your first name"
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
                      Last name
                    </Form.Label>
                    <Form.Control>
                      <TextInput
                        {...field}
                        autoComplete="family-name"
                        placeholder="Your last name"
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
                      User name
                    </Form.Label>
                    <Form.Control>
                      <TextInput
                        {...field}
                        autoComplete="username"
                        placeholder="A name others see"
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
                      Email <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control>
                      <TextInput
                        {...field}
                        type="email"
                        autoComplete="email"
                        placeholder="name@example.com"
                      />
                    </Form.Control>
                    <Form.Description>
                      Sign-in address and where ticket updates are sent.
                    </Form.Description>
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
                      Phone
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
                      Company name
                    </Form.Label>
                    <Form.Control>
                      <TextInput
                        {...field}
                        autoComplete="organization"
                        placeholder="The company you work for"
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
              {dirty ? 'You have unsaved changes.' : 'Everything is saved.'}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                disabled={busy || !dirty}
                onClick={() => reset(valuesOf(current))}
              >
                Discard
              </Button>
              <Button
                type="submit"
                disabled={busy || !dirty}
                className="min-w-28"
              >
                <Icon name="check" size={15} />
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};

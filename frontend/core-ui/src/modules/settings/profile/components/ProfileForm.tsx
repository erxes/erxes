import { useCallback, useEffect, useRef } from 'react';
import { SubmitHandler } from 'react-hook-form';

import {
  AdvancedFields,
  DefaultFields,
  FormField,
  LinkFields,
} from '@/settings/profile/components/fields';
import { ProfileLoading } from '@/settings/profile/components/ProfileLoading';
import { useProfile } from '@/settings/profile/hooks/useProfile';
import {
  FormType,
  getProfilePatch,
  getProfileValuesAfterSave,
  normalizeProfileLinks,
  useProfileForm,
} from '@/settings/profile/hooks/useProfileForm';
import { Button, Form, Spinner, Upload, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const ProfileForm = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'profile',
  });
  const { form } = useProfileForm();
  const { dirtyFields } = form.formState;
  const saveInProgressRef = useRef(false);

  const { loading, profileUpdate, profile, updating } = useProfile();

  const submitHandler: SubmitHandler<FormType> = useCallback(
    (data) => {
      const patch = getProfilePatch(data, dirtyFields);
      if (Object.keys(patch).length === 0) {
        toast({ title: t('no-profile-changes', 'No profile changes to save') });
        return;
      }
      const submittedValues = structuredClone(form.getValues());
      profileUpdate({
        variables: patch,
        onStart: () => {
          saveInProgressRef.current = true;
        },
        onCompleted: ({ usersEditProfilePatch: saved }) => {
          const currentValues = structuredClone(form.getValues());
          // Saved values become the baseline; only later edits stay dirty.
          form.reset({
            username: saved.username,
            positionIds: saved.positionIds ?? [],
            email: saved.email,
            details: saved.details,
            links: normalizeProfileLinks(saved.links),
          });
          form.reset(
            getProfileValuesAfterSave(
              form.getValues(),
              submittedValues,
              currentValues,
            ),
            { keepDefaultValues: true },
          );
          saveInProgressRef.current = false;
        },
        onError: () => {
          saveInProgressRef.current = false;
        },
      });
    },
    [dirtyFields, form, profileUpdate, t],
  );

  useEffect(() => {
    // Apollo cache effects can run before the mutation's completion callback.
    if (
      !saveInProgressRef.current &&
      profile &&
      Object.keys(profile).length > 0
    ) {
      form.reset(
        {
          username: profile.username,
          positionIds: profile.positionIds ?? [],
          email: profile.email,
          details: profile.details,
          links: normalizeProfileLinks(profile.links),
        },
        { keepDirtyValues: true },
      );
    }
  }, [profile, form]);

  if (loading) {
    return <ProfileLoading />;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submitHandler, () => {
          toast({
            title: t('error-updating-profile'),
            description: t(
              'check-profile-fields',
              'Please check the profile fields for invalid values.',
            ),
            variant: 'destructive',
          });
        })}
        className="grid gap-5"
      >
        <div className="flex flex-col gap-4">
          <Form.Label>{t('profile-picture')}</Form.Label>
          <Form.Field
            control={form.control}
            name="details.avatar"
            render={({ field }) => (
              <Form.Item>
                <Form.Control>
                  <Upload.Root
                    {...field}
                    value={field.value ?? ''}
                    onChange={(fileInfo) =>
                      field.onChange(
                        fileInfo && 'url' in fileInfo ? fileInfo.url : '',
                      )
                    }
                  >
                    <Upload.Preview />
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-4">
                        <Upload.Button
                          size="sm"
                          variant="outline"
                          type="button"
                        />
                        <Upload.RemoveButton
                          size="sm"
                          variant="outline"
                          type="button"
                        />
                      </div>
                      <Form.Description>
                        {t('profile-description')}
                      </Form.Description>
                    </div>
                  </Upload.Root>
                </Form.Control>
              </Form.Item>
            )}
          />
        </div>
        <div className="flex flex-col gap-3">
          <Form.Label>{t('name')}</Form.Label>
          <Form.Description>{t('name-description')}</Form.Description>
          <DefaultFields />
        </div>
        <div className="flex flex-col gap-3">
          <Form.Label>{t('email')}</Form.Label>
          <Form.Description>{t('email-description')}</Form.Description>
          <FormField
            name={'email' as keyof FormType}
            element="input"
            attributes={{
              type: 'email',
              placeholder: t('enter-email'),
            }}
          />
        </div>
        <div className="flex flex-col gap-3">
          <AdvancedFields />
        </div>
        <div className="flex flex-col flex-1 gap-3">
          <Form.Label>{t('link')}</Form.Label>
          <Form.Description>{t('link-description')}</Form.Description>
          <LinkFields />
        </div>
        <div className="w-full flex justify-end">
          <Button type="submit" disabled={updating} size="sm">
            {(updating && <Spinner size={'sm'} className="text-white" />) ||
              t('update')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

import { useCallback, useEffect } from 'react';
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
  useProfileForm,
} from '@/settings/profile/hooks/useProfileForm';
import { Button, Form, Spinner, Upload } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const ProfileForm = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'profile',
  });
  const { form } = useProfileForm();

  const { loading, profileUpdate, profile, updating } = useProfile();

  const submitHandler: SubmitHandler<FormType> = useCallback(
    (data) => {
      profileUpdate({
        variables: data,
      });
    },
    [profileUpdate],
  );

  useEffect(() => {
    if (profile && Object.keys(profile).length > 0) {
      form.reset({
        username: profile.username,
        positionIds: profile.positionIds,
        email: profile.email,
        details: profile.details,
        links: profile.links,
      });
    }
  }, [profile, form]);

  if (loading) {
    return <ProfileLoading />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitHandler)} className="grid gap-5">
        <div className="flex flex-col gap-4">
          <Form.Label>{t('profile-picture')}</Form.Label>
          <Form.Field
            control={form.control}
            name="details.avatar"
            render={({ field }: { field: any }) => (
              <Form.Item>
                <Form.Control>
                  <Upload.Root
                    {...field}
                    onChange={(fileInfo: any) => field.onChange(fileInfo?.url)}
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
          <Form.Description>
            {t('email-description')}
          </Form.Description>
          <FormField
            name={'email' as keyof FormType}
            element="input"
            attributes={{
              type: 'email',
              placeholder: 'Enter email',
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

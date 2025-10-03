import { useCallback, useEffect } from 'react';
import { SubmitHandler } from 'react-hook-form';

import { Button, Form, Spinner, Upload } from 'erxes-ui';
import { useProfile } from '@/settings/profile/hooks/useProfile';
import {
  FormType,
  useProfileForm,
} from '@/settings/profile/hooks/useProfileForm';
import {
  AdvancedFields,
  DefaultFields,
  FormField,
  LinkFields,
} from '@/settings/profile/components/fields';
import { ProfileLoading } from '@/settings/profile/components/ProfileLoading';

export const ProfileForm = () => {
  const { form } = useProfileForm();

  const { loading, profileUpdate, profile, updating } = useProfile();

  const submitHandler: SubmitHandler<FormType> = useCallback(
    async (data) => {
      profileUpdate(data as any);
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
          <Form.Label>Profile picture</Form.Label>
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
                        Upload a profile picture to help identify you.
                      </Form.Description>
                    </div>
                  </Upload.Root>
                </Form.Control>
              </Form.Item>
            )}
          />
        </div>
        <div className="flex flex-col gap-3">
          <Form.Label>Name</Form.Label>
          <Form.Description>This is your public display name.</Form.Description>
          <DefaultFields />
        </div>
        <div className="flex flex-col gap-3">
          <Form.Label>Email</Form.Label>
          <Form.Description>
            This is your public email address.
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
          <Form.Label>Links</Form.Label>
          <Form.Description>This is your social links.</Form.Description>
          <LinkFields />
        </div>
        <div className="w-full flex justify-end">
          <Button type="submit" disabled={updating} size="sm">
            {(updating && <Spinner size={'sm'} className="text-white" />) ||
              'Update'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

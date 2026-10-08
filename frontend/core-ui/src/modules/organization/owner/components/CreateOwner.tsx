import { useCallback } from 'react';
import { SubmitHandler } from 'react-hook-form';

import { Button, Checkbox, Form, Input, Select } from 'erxes-ui';

import { useCreateOwner } from '@/organization/owner/hooks/useCreateOwner';
import {
  CreateOwnerFormType,
  PURPOSE_OPTIONS,
  useCreateOwnerForm,
} from '@/organization/owner/hooks/useCreateOwnerForm';
import { useTranslation } from 'react-i18next';

export const CreateOwner = () => {
  const { t } = useTranslation('organization', { keyPrefix: 'create-owner' });
  const { form } = useCreateOwnerForm();
  const { createOwner } = useCreateOwner();

  const submitHandler: SubmitHandler<CreateOwnerFormType> = useCallback(
    async (data) => {
      createOwner(data);
    },
    [createOwner],
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submitHandler)}
        className="mx-auto grid w-[350px] gap-5"
      >
        <Form.Field
          name="email"
          control={form.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <Input type="email" placeholder={t('enter-email')} {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          name="firstName"
          control={form.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <Input
                  type="text"
                  placeholder={t('enter-first-name')}
                  {...field}
                />
              </Form.Control>
            </Form.Item>
          )}
        />

        <Form.Field
          name="lastName"
          control={form.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <Input
                  type="text"
                  placeholder={t('enter-last-name')}
                  {...field}
                />
              </Form.Control>
            </Form.Item>
          )}
        />

        <Form.Field
          name="password"
          control={form.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <Input
                  type="password"
                  placeholder={t('enter-password')}
                  {...field}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          name="confirmPassword"
          control={form.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <Input
                  type="password"
                  placeholder={t('confirm-password')}
                  {...field}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          name="purpose"
          control={form.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <Select.Trigger
                    className={!field.value ? 'text-muted-foreground' : ''}
                  >
                    {field.value || t('select-purpose')}
                  </Select.Trigger>
                  <Select.Content>
                    {PURPOSE_OPTIONS.map((option) => (
                      <Select.Item key={option.value} value={option.value}>
                        {t(option.labelKey)}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          name="subscribeEmail"
          control={form.control}
          render={({ field }) => (
            <Form.Item className="flex flex-row items-start space-x-3 space-y-0">
              <Form.Control>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Form.Control>
              <div className="space-y-1 leading-none">
                <Form.Label>{t('subscribe-to-email-updates')}</Form.Label>
              </div>
            </Form.Item>
          )}
        />

        <Button type="submit">{t('create-owner')}</Button>
      </form>
    </Form>
  );
};

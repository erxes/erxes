import { useChannelsForm } from '@/channels/hooks/useChannelsForm';
import { IChannel, TChannelForm } from '@/channels/types';
import { useChannelUpdate } from '@/channels/hooks/useChannelUpdate';
import { Button, Form, IconPicker, Input, Textarea, useToast } from 'erxes-ui';
import { SubmitHandler } from 'react-hook-form';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const UpdateChannelForm = ({ channel }: { channel: IChannel }) => {
  const { t } = useTranslation('frontline');
  const { toast } = useToast();
  const { updateChannel } = useChannelUpdate();
  const form = useChannelsForm({
    defaultValues: {
      name: channel.name,
      description: channel.description,
      icon: channel.icon,
    },
  });

  const submitHandler: SubmitHandler<TChannelForm> = React.useCallback(
    async (data) => {
      updateChannel({
        variables: {
          id: channel._id,
          ...data,
        },
        onCompleted: () => {
          toast({ title: t('success', 'Success!') });
        },
        onError: (error) => {
          toast({
            title: t('error', 'Error'),
            description: error.message,
            variant: 'destructive',
          });
        },
      });
    },
    [updateChannel, channel._id],
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submitHandler)}
        className="flex flex-col gap-2 size-full"
      >
        <div className="flex w-full gap-4">
          <div className="shrink-0">
            <Form.Field
              control={form.control}
              name="icon"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('icon', 'Icon')}</Form.Label>
                  <Form.Description className="sr-only">
                    {t('icon', 'Icon')}
                  </Form.Description>
                  <Form.Control>
                    <IconPicker
                      onValueChange={field.onChange}
                      value={field.value}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
          <div className="flex-1">
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('name', 'Name')}</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                </Form.Item>
              )}
            />
          </div>
        </div>
        <Form.Field
          control={form.control}
          name="description"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('description', 'Description')}</Form.Label>
              <Form.Control>
                <Textarea {...field} />
              </Form.Control>
            </Form.Item>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit">{t('update', 'Update')}</Button>
        </div>
      </form>
    </Form>
  );
};

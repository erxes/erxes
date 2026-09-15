import { Button, Dialog, Form, Input, Select, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ViberSendRecovery } from './ViberSendRecovery';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import {
  buildViberSpecialMessage,
  createViberSpecialSchema,
  viberSpecialSchema,
} from '../validation';
import { useViberSend } from '../hooks/useViberSend';

type Values = z.infer<typeof viberSpecialSchema>;
const fields: Record<
  Values['type'],
  { name: Exclude<keyof Values, 'type'>; label: string; placeholder?: string }[]
> = {
  url: [{ name: 'url', label: 'Link', placeholder: 'https://example.com' }],
  location: [
    { name: 'lat', label: 'Latitude', placeholder: '−90 … 90' },
    { name: 'lon', label: 'Longitude', placeholder: '−180 … 180' },
  ],
  contact: [
    { name: 'name', label: 'Contact name' },
    { name: 'phone', label: 'Phone number', placeholder: '+976…' },
  ],
  sticker: [{ name: 'stickerId', label: 'Viber sticker ID' }],
};

export const ViberSpecialMessage = ({
  conversationId,
  disabled,
}: {
  conversationId: string;
  disabled: boolean;
}) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);
  const { send, recover, unconfirmed, loading } = useViberSend();
  const form = useForm<Values>({
    resolver: zodResolver(createViberSpecialSchema(t)),
    defaultValues: {
      type: 'url',
      url: '',
      lat: '',
      lon: '',
      name: '',
      phone: '',
      stickerId: '',
    },
  });
  const onSubmit = async (values: Values): Promise<void> => {
    if (disabled || loading || unconfirmed) return;
    if (
      await send({ conversationId, message: buildViberSpecialMessage(values) })
    ) {
      form.reset();
      setOpen(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={(next) => !loading && setOpen(next)}>
      <Dialog.Trigger asChild>
        <Button variant="ghost" size="sm" disabled={disabled}>
          {t('viber-more-message-types', {
            defaultValue: 'More message types',
          })}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>
            {t('send-message', { defaultValue: 'Send message' })}
          </Dialog.Title>
          <Dialog.Description>
            {t('viber-special-message-help', {
              defaultValue:
                'Send a link, location, contact, or sticker as a separate message.',
            })}
          </Dialog.Description>
        </Dialog.Header>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <fieldset disabled={loading || unconfirmed} className="space-y-4">
              <Form.Field
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      {t('message-type', { defaultValue: 'Message type' })}
                    </Form.Label>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={loading || unconfirmed}
                    >
                      <Form.Control>
                        <Select.Trigger>
                          <Select.Value />
                        </Select.Trigger>
                      </Form.Control>
                      <Select.Content>
                        <Select.Item value="url">
                          {t('link', { defaultValue: 'Link' })}
                        </Select.Item>
                        <Select.Item value="location">
                          {t('location', { defaultValue: 'Location' })}
                        </Select.Item>
                        <Select.Item value="contact">
                          {t('contact', { defaultValue: 'Contact' })}
                        </Select.Item>
                        <Select.Item value="sticker">
                          {t('sticker', { defaultValue: 'Sticker' })}
                        </Select.Item>
                      </Select.Content>
                    </Select>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              {fields[form.watch('type')].map(
                ({ name, label, placeholder }) => (
                  <Form.Field
                    key={name}
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>
                          {t(`viber-special-${name}`, { defaultValue: label })}
                        </Form.Label>
                        <Form.Control>
                          <Input
                            {...field}
                            placeholder={placeholder}
                            disabled={loading || unconfirmed}
                          />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                ),
              )}
            </fieldset>
            {unconfirmed && (
              <ViberSendRecovery
                loading={loading}
                onRecover={async () => {
                  if (await recover()) {
                    form.reset();
                    setOpen(false);
                  }
                }}
              />
            )}
            <Dialog.Footer>
              <Button
                type="button"
                variant="ghost"
                disabled={loading}
                onClick={() => setOpen(false)}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={disabled || loading || unconfirmed}
              >
                {loading && <Spinner size="sm" />}
                {t('send')}
              </Button>
            </Dialog.Footer>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
};

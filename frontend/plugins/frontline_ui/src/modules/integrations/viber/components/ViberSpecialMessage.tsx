import { Button, Dialog, Form, Input, Select, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { buildViberSpecialMessage, viberSpecialSchema } from '../validation';
import { useViberSend } from '../hooks/useViberSend';

type Values = z.infer<typeof viberSpecialSchema>;
const fields: Record<
  Values['type'],
  { name: Exclude<keyof Values, 'type'>; label: string; placeholder?: string }[]
> = {
  url: [{ name: 'url', label: 'Link', placeholder: 'https://example.com' }],
  location: [
    { name: 'lat', label: 'Latitude', placeholder: '-90 to 90' },
    { name: 'lon', label: 'Longitude', placeholder: '-180 to 180' },
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
  const [open, setOpen] = useState(false);
  const { send, loading } = useViberSend();
  const form = useForm<Values>({
    resolver: zodResolver(viberSpecialSchema),
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
    if (disabled || loading) return;
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
          More message types
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>Send message</Dialog.Title>
          <Dialog.Description>
            Send a link, location, contact, or sticker as a separate message.
          </Dialog.Description>
        </Dialog.Header>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Form.Field
              control={form.control}
              name="type"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Message type</Form.Label>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={loading}
                  >
                    <Form.Control>
                      <Select.Trigger>
                        <Select.Value />
                      </Select.Trigger>
                    </Form.Control>
                    <Select.Content>
                      <Select.Item value="url">Link</Select.Item>
                      <Select.Item value="location">Location</Select.Item>
                      <Select.Item value="contact">Contact</Select.Item>
                      <Select.Item value="sticker">Sticker</Select.Item>
                    </Select.Content>
                  </Select>
                  <Form.Message />
                </Form.Item>
              )}
            />
            {fields[form.watch('type')].map(({ name, label, placeholder }) => (
              <Form.Field
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{label}</Form.Label>
                    <Form.Control>
                      <Input
                        {...field}
                        placeholder={placeholder}
                        disabled={loading}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            ))}
            <Dialog.Footer>
              <Button
                type="button"
                variant="ghost"
                disabled={loading}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={disabled || loading}>
                {loading && <Spinner size="sm" />}Send
              </Button>
            </Dialog.Footer>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
};

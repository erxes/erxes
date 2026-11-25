import { zodResolver } from '@hookform/resolvers/zod';
import { IconX } from '@tabler/icons-react';
import { Button, Dialog, Form, Textarea } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const cancelSchema = z.object({
  reason: z.string().trim().max(300),
});

type TPapaCancelForm = z.infer<typeof cancelSchema>;

interface PapaCancelDialogProps {
  busy: boolean;
  onCancel: (reason?: string) => Promise<boolean>;
}

/** Cancels the delivery with Papa, keeping why on the order. */
export const PapaCancelDialog = ({ busy, onCancel }: PapaCancelDialogProps) => {
  const { t } = useTranslation('sales');
  const [open, setOpen] = useState(false);
  const form = useForm<TPapaCancelForm>({
    resolver: zodResolver(cancelSchema),
    defaultValues: { reason: '' },
  });

  const submit = async ({ reason }: TPapaCancelForm) => {
    if (await onCancel(reason || undefined)) {
      form.reset();
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline" disabled={busy}>
          <IconX />
          {t('papa-cancel', 'Cancel delivery')}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>{t('papa-cancel', 'Cancel delivery')}</Dialog.Title>
          <Dialog.Description>
            {t(
              'papa-cancel-confirm',
              'Cancel this delivery with Papa? A driver who already accepted it will be released.',
            )}
          </Dialog.Description>
        </Dialog.Header>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submit)}
            className="space-y-4"
            noValidate
          >
            <Form.Field
              control={form.control}
              name="reason"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    {t('papa-cancel-reason', 'Reason (optional)')}
                  </Form.Label>
                  <Form.Control>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder={t(
                        'papa-cancel-reason-placeholder',
                        'e.g. The customer cancelled the order',
                      )}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Dialog.Footer>
              <Dialog.Close asChild>
                <Button type="button" variant="ghost" disabled={busy}>
                  {t('papa-keep-delivery', 'Keep delivery')}
                </Button>
              </Dialog.Close>
              <Button type="submit" variant="destructive" disabled={busy}>
                {t('papa-cancel', 'Cancel delivery')}
              </Button>
            </Dialog.Footer>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
};

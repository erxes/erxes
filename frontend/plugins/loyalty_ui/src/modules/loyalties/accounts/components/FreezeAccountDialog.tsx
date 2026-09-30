import { Button, Dialog, Form, Textarea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useFreezeAccountForm } from '../hooks/useFreezeAccountForm';

export const FreezeAccountDialog = ({
  accountId,
  open,
  onOpenChange,
}: {
  accountId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation('loyalty');
  const { form, onSubmit, loading } = useFreezeAccountForm({
    accountId,
    open,
    onDone: () => onOpenChange(false),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>{t('loyalty-account-freeze')}</Dialog.Title>
          <Dialog.Description>
            {t('loyalty-account-freeze-description')}
          </Dialog.Description>
        </Dialog.Header>
        <Form {...form}>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Form.Field
              control={form.control}
              name="reason"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('reason')}</Form.Label>
                  <Form.Control>
                    <Textarea {...field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Dialog.Footer>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" variant="destructive" disabled={loading}>
                {t('loyalty-account-freeze')}
              </Button>
            </Dialog.Footer>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
};

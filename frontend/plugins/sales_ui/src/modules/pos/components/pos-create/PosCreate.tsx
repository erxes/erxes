import { usePosCreateForm } from '@/pos/components/pos-create/usePosCreateForm';
import { Button, Form, Input, Sheet, Textarea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

interface PosCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // The new POS's id, for a caller that picks what was just made
  onCreateSuccess?: (posId?: string) => void;
}

export const PosCreate = ({
  open,
  onOpenChange,
  onCreateSuccess,
}: PosCreateDialogProps) => {
  const { t } = useTranslation('sales');
  const { form, onSubmit, submitting, reset } = usePosCreateForm((posId) => {
    onOpenChange(false);
    onCreateSuccess?.(posId);
  });

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
    }
    onOpenChange(isOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <Sheet.View className="flex-col p-0 h-full max-h-screen sm:max-w-md">
        <Sheet.Header className="px-5 shrink-0">
          <Sheet.Title className="text-lg font-bold">
            {t('pos-create')}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="flex flex-col flex-1 min-h-0 bg-background"
          >
            <div className="overflow-y-auto flex-1 px-5 py-5 space-y-4 min-h-0">
              <Form.Field
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      {t('name')} <span className="text-destructive">*</span>
                    </Form.Label>
                    <Form.Control>
                      <Input
                        {...field}
                        placeholder={t('pos-name-placeholder')}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="description"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('description')}</Form.Label>
                    <Form.Control>
                      <Textarea
                        {...field}
                        placeholder={t('pos-description-placeholder')}
                        rows={3}
                      />
                    </Form.Control>
                  </Form.Item>
                )}
              />
            </div>

            <Sheet.Footer className="px-5 py-4 border-t bg-background">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={submitting}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? t('creating') : t('pos-create')}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};

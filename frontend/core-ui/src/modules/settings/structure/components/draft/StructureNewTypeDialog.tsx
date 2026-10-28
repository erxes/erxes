import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Dialog, Form, Input } from 'erxes-ui';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useStructureDraft } from '../../hooks/useStructureDraft';
import {
  getStructureTypeNameSchema,
  TStructureTypeNameForm,
} from '../../schemas/structureEntitySchema';

export const StructureNewTypeDialog = ({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (typeId: string) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { createType, busy } = useStructureDraft();
  const schema = useMemo(() => getStructureTypeNameSchema(t), [t]);
  const form = useForm<TStructureTypeNameForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: '' });
    }
  }, [open, form]);

  const onSubmit = async ({ name }: TStructureTypeNameForm) => {
    const typeId = await createType(name);

    if (typeId) {
      onOpenChange(false);
      onCreated(typeId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.ContentCombined
        title={t('new-type-title')}
        description={t('new-type-description')}
        className="sm:max-w-md"
      >
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <p className="text-sm text-muted-foreground">
              {t('new-type-description')}
            </p>
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('name')}</Form.Label>
                  <Form.Control>
                    <Input {...field} autoFocus />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Dialog.Footer>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={busy}>
                {t('create')}
              </Button>
            </Dialog.Footer>
          </form>
        </Form>
      </Dialog.ContentCombined>
    </Dialog>
  );
};

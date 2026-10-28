import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Dialog, Form } from 'erxes-ui';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useStructureEntitySave } from '../../hooks/useStructureEntitySave';
import { getStructureContactSchema } from '../../schemas/structureEntitySchema';
import {
  IStructureContactForm,
  IStructureEntityDetail,
} from '../../types/structureEntity';
import {
  toStructureContactFormValues,
  toStructureContactInput,
} from '../../utils/structureEntityInput';
import { StructureContactFields } from './StructureContactFields';

export const StructureContactDialog = ({
  entity,
  onClose,
}: {
  entity: IStructureEntityDetail;
  onClose: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const schema = useMemo(() => getStructureContactSchema(t), [t]);
  const form = useForm<IStructureContactForm>({
    resolver: zodResolver(schema),
    defaultValues: toStructureContactFormValues(entity.contact),
  });
  const { save, saving } = useStructureEntitySave();

  const onSubmit = async (values: IStructureContactForm) => {
    const saved = await save(
      { _id: entity._id, contact: toStructureContactInput(values) },
      t('contact-saved'),
    );

    if (saved) {
      onClose();
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <Dialog.ContentCombined
        title={t('contact')}
        description={t('capability-dialog-description', {
          title: entity.title,
        })}
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
      >
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <StructureContactFields />
            <Dialog.Footer>
              <Button type="button" variant="secondary" onClick={onClose}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={saving}>
                {t('save')}
              </Button>
            </Dialog.Footer>
          </form>
        </Form>
      </Dialog.ContentCombined>
    </Dialog>
  );
};

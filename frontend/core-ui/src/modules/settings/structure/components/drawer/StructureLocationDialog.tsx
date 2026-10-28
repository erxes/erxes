import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Dialog, Form, Textarea } from 'erxes-ui';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useStructureEntitySave } from '../../hooks/useStructureEntitySave';
import { getStructureLocationSchema } from '../../schemas/structureEntitySchema';
import {
  IStructureEntityDetail,
  IStructureLocationForm,
} from '../../types/structureEntity';
import {
  toStructureLocationFormValues,
  toStructureLocationInput,
} from '../../utils/structureEntityInput';
import { getStructureFallbackCenter } from '../../utils/structureTree';
import { StructureLocationField } from '../location/StructureLocationField';

export const StructureLocationDialog = ({
  entity,
  onClose,
}: {
  entity: IStructureEntityDetail;
  onClose: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const schema = useMemo(() => getStructureLocationSchema(t), [t]);
  const form = useForm<IStructureLocationForm>({
    resolver: zodResolver(schema),
    defaultValues: toStructureLocationFormValues(entity.location),
  });
  const { save, saving } = useStructureEntitySave();
  const fallbackCenter = useMemo(
    () => getStructureFallbackCenter(entity.path),
    [entity.path],
  );

  const onSubmit = async (values: IStructureLocationForm) => {
    const saved = await save(
      { _id: entity._id, location: toStructureLocationInput(values) },
      t('location-saved'),
    );

    if (saved) {
      onClose();
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <Dialog.ContentCombined
        title={t('location')}
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
            <Form.Field
              control={form.control}
              name="location.address"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('address')}</Form.Label>
                  <Form.Control>
                    <Textarea
                      {...field}
                      rows={2}
                      placeholder={t('provide-address')}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <StructureLocationField fallbackCenter={fallbackCenter} />
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

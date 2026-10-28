import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Dialog, Form, Input, Spinner, Textarea } from 'erxes-ui';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  IStructureAccessPosition,
  useStructurePositionMutations,
} from '@/structure-access';
import { PermissionGroupsCheckboxList } from '@/settings/permissions/components/PermissionGroupsCheckboxList';
import { useGetPermissionGroups } from '@/settings/permissions/hooks/useGetPermissionGroups';
import { useStructureFeedback } from '../../hooks/useStructureFeedback';
import {
  getStructurePositionSchema,
  TStructurePositionForm,
} from '../../schemas/structureEntitySchema';

const toFormValues = (
  position: IStructureAccessPosition | null,
): TStructurePositionForm => ({
  name: position?.name ?? '',
  description: position?.description ?? '',
  groupIds: position?.groupIds ?? [],
});

export const StructurePositionDialog = ({
  position,
  onClose,
}: {
  position: IStructureAccessPosition | null;
  onClose: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const schema = useMemo(() => getStructurePositionSchema(t), [t]);
  const form = useForm<TStructurePositionForm>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(position),
  });
  const { addPosition, editPosition, saving } = useStructurePositionMutations();
  const { permissionGroups, loading, error } = useGetPermissionGroups();
  const { success, failure } = useStructureFeedback();

  const onSubmit = ({
    name,
    description,
    groupIds,
  }: TStructurePositionForm) => {
    const variables = { name: name.trim(), description, groupIds };
    const onCompleted = () => {
      success(t(position ? 'position-saved' : 'position-created', { name }));
      onClose();
    };

    if (position) {
      editPosition({
        variables: { _id: position._id, ...variables },
        onCompleted,
        onError: failure,
      });
      return;
    }

    addPosition({ variables, onCompleted, onError: failure });
  };

  const renderGroups = (
    value: string[],
    onValueChange: (groupIds: string[]) => void,
  ) => {
    if (loading) {
      return <Spinner containerClassName="py-6" />;
    }

    if (error) {
      return <p className="text-sm text-destructive">{error.message}</p>;
    }

    return (
      <PermissionGroupsCheckboxList
        groups={permissionGroups}
        value={value}
        onValueChange={onValueChange}
        disabled={saving}
      />
    );
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <Dialog.ContentCombined
        title={position ? t('edit-position') : t('add-position')}
        description={t('position-dialog-description')}
        className="flex max-h-[90vh] flex-col sm:max-w-lg"
      >
        <Form {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1 styled-scroll">
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
              <Form.Field
                control={form.control}
                name="description"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('description')}</Form.Label>
                    <Form.Control>
                      <Textarea {...field} rows={2} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="groupIds"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('permission-groups')}</Form.Label>
                    <Form.Description>
                      {t('position-groups-description')}
                    </Form.Description>
                    {renderGroups(field.value, field.onChange)}
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>
            <Dialog.Footer className="border-t pt-4">
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

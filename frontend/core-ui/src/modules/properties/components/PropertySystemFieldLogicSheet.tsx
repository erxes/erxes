import { Button, Sheet, Spinner, toast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Can } from 'ui-modules';
import { useEditPropertySystemField } from '../hooks/useEditPropertySystemField';
import { IPropertyForm, IPropertySystemField } from '../types/Properties';
import { PropertyFormLogicFields } from './PropertyFormLogicFields';

const SystemFieldLogicForm = ({
  field,
  contentType,
  onClose,
}: {
  field: IPropertySystemField;
  contentType: string;
  onClose: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { editSystemField, loading } = useEditPropertySystemField(contentType);
  const form = useForm<IPropertyForm>({
    defaultValues: { logics: field.logics },
  });

  const handleSubmit = form.handleSubmit(async ({ logics }) => {
    const result = await editSystemField(field.code, {
      logics: (logics || []).filter((rule) => rule.field),
    });

    if (result.data) {
      toast({
        title: t('property-updated', 'Property updated'),
        variant: 'success',
      });
      onClose();
    }
  });

  return (
    <form className="flex h-full w-full flex-col" onSubmit={handleSubmit}>
      <Sheet.Header>
        <Sheet.Title className="text-lg text-foreground">
          {field.name}
        </Sheet.Title>
        <Sheet.Description className="sr-only">
          {t(
            'logic-description',
            'Create rules to show or hide this element depending on the values of other properties.',
          )}
        </Sheet.Description>
        <Sheet.Close />
      </Sheet.Header>
      <Sheet.Content className="overflow-y-auto px-5 py-4">
        <PropertyFormLogicFields form={form} contentType={contentType} />
      </Sheet.Content>
      <Sheet.Footer>
        <Button type="button" variant="ghost" onClick={onClose}>
          {t('cancel', 'Cancel')}
        </Button>
        <Can action="fieldsManage">
          <Button type="submit" disabled={loading}>
            {loading && <Spinner containerClassName="flex-none" />}
            {t('update-property', 'Update Property')}
          </Button>
        </Can>
      </Sheet.Footer>
    </form>
  );
};

export const PropertySystemFieldLogicSheet = ({
  field,
  contentType,
  onClose,
}: {
  field: IPropertySystemField | null;
  contentType: string;
  onClose: () => void;
}) => (
  <Sheet open={!!field} onOpenChange={(open) => !open && onClose()}>
    <Sheet.View className="p-0">
      {field && (
        <SystemFieldLogicForm
          key={field.code}
          field={field}
          contentType={contentType}
          onClose={onClose}
        />
      )}
    </Sheet.View>
  </Sheet>
);

import { IconPlus } from '@tabler/icons-react';
import { Button, Form, Select, Sheet } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useFieldGroups } from 'ui-modules';
import { IPropertyForm } from '../types/Properties';
import { useAddPropertyGroup } from '../hooks/useAddPropertyGroup';
import { PropertyGroupForm } from './PropertyGroupForm';

export const PropertyFormGroupField = ({
  form,
  contentType,
}: {
  form: UseFormReturn<IPropertyForm>;
  contentType: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { fieldGroups } = useFieldGroups({ contentType });
  const { addPropertyGroup, loading } = useAddPropertyGroup();
  const [open, setOpen] = useState(false);
  const [pendingGroupId, setPendingGroupId] = useState<string | null>(null);

  useEffect(() => {
    if (!pendingGroupId) return;
    if (fieldGroups.some((group) => group._id === pendingGroupId)) {
      form.setValue('groupId', pendingGroupId, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setPendingGroupId(null);
    }
  }, [pendingGroupId, fieldGroups, form]);

  const handleCreateGroup = async (data: { name: string; code?: string }) => {
    const result = await addPropertyGroup({
      variables: { name: data.name, code: data.code, contentType },
    });
    const newGroupId = result?.data?.fieldGroupAdd?._id;
    if (newGroupId) {
      setPendingGroupId(newGroupId);
    }
    setOpen(false);
  };

  return (
    <Form.Field
      name="groupId"
      render={({ field }) => (
        <Form.Item className="flex-auto">
          <Form.Label>{t('group', 'Group')}</Form.Label>
          <div className="flex gap-2">
            <Select value={field.value} onValueChange={field.onChange}>
              <Form.Control>
                <Select.Trigger className="flex-1">
                  <Select.Value
                    placeholder={t('select-group', 'Select group')}
                  />
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                {fieldGroups.map((group) => (
                  <Select.Item key={group._id} value={group._id}>
                    {group.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Sheet open={open} onOpenChange={setOpen}>
              <Sheet.Trigger asChild>
                <Button type="button" variant="secondary" className="flex-none">
                  <IconPlus />
                  {t('add-group', 'Add group')}
                </Button>
              </Sheet.Trigger>
              <Sheet.View
                className="p-0"
                onEscapeKeyDown={(e) => {
                  e.preventDefault();
                }}
              >
                <PropertyGroupForm
                  onSubmit={handleCreateGroup}
                  loading={loading}
                  defaultValues={{ name: '', code: '' }}
                  onCancel={() => setOpen(false)}
                />
              </Sheet.View>
            </Sheet>
          </div>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

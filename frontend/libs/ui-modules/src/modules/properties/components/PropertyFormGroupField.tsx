import { IconFolder, IconPlus } from '@tabler/icons-react';
import { Button, Form, Popover, Select, Sheet } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useFieldGroups } from '../hooks/useFieldGroups';
import { IPropertyForm } from '../types/propertyFormTypes';
import { useAddPropertyGroup } from '../hooks/useAddPropertyGroup';
import { PropertyGroupForm } from './PropertyGroupForm';
import {
  PANEL_INPUT_CLASS_NAME,
  PanelFormRow,
} from '../../widget/record-side-panel/PanelForm';

export const PropertyFormGroupField = ({
  form,
  contentType,
  variant = 'default',
}: {
  form: UseFormReturn<IPropertyForm>;
  contentType: string;
  variant?: 'default' | 'panel';
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { fieldGroups } = useFieldGroups({ contentType });
  const { addPropertyGroup, loading } = useAddPropertyGroup(contentType);
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

  // Nothing to choose when the content type has a single group.
  useEffect(() => {
    if (form.getValues('groupId') || fieldGroups.length !== 1) return;
    form.setValue('groupId', fieldGroups[0]._id, { shouldValidate: true });
  }, [fieldGroups, form]);

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

  const isPanel = variant === 'panel';

  const groupForm = (
    <PropertyGroupForm
      onSubmit={handleCreateGroup}
      loading={loading}
      defaultValues={{ name: '', code: '', isMultiple: false }}
      onCancel={() => setOpen(false)}
      contentType={contentType}
      layout={isPanel ? 'record' : 'sheet'}
    />
  );

  const addGroup = isPanel ? (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 flex-none"
          title={t('add-group', 'Add group')}
        >
          <IconPlus />
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-80 p-0" align="end">
        {groupForm}
      </Popover.Content>
    </Popover>
  ) : (
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
        {groupForm}
      </Sheet.View>
    </Sheet>
  );

  return (
    <Form.Field
      name="groupId"
      render={({ field, fieldState }) => {
        const select = (
          <Select value={field.value} onValueChange={field.onChange}>
            {isPanel ? (
              <Select.Trigger className={`flex-1 ${PANEL_INPUT_CLASS_NAME}`}>
                <Select.Value placeholder={t('select-group', 'Select group')} />
              </Select.Trigger>
            ) : (
              <Form.Control>
                <Select.Trigger className="flex-1">
                  <Select.Value
                    placeholder={t('select-group', 'Select group')}
                  />
                </Select.Trigger>
              </Form.Control>
            )}
            <Select.Content>
              {fieldGroups.map((group) => (
                <Select.Item key={group._id} value={group._id}>
                  {group.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        );

        if (isPanel) {
          return (
            <PanelFormRow
              label={t('group', 'Group')}
              icon={IconFolder}
              required
              error={fieldState.error?.message}
            >
              <div className="flex items-center gap-1">
                {select}
                {addGroup}
              </div>
            </PanelFormRow>
          );
        }

        return (
          <Form.Item className="flex-auto">
            <Form.Label>{t('group', 'Group')}</Form.Label>
            <div className="flex gap-2">
              {select}
              {addGroup}
            </div>
            <Form.Message />
          </Form.Item>
        );
      }}
    />
  );
};

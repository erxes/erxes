import {
  Button,
  Sheet,
  Input,
  Select,
  Switch,
  Textarea,
  Form,
} from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { IconPencil, IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
  ICustomField,
  FieldFormValues,
  FIELD_TYPES,
} from '../../types/customFieldTypes';

interface FieldDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FieldFormValues) => void;
  editingField: ICustomField | null;
}

const DEFAULT_VALUES: FieldFormValues = {
  label: '',
  code: '',
  type: 'text',
  description: '',
  isRequired: false,
  options: '',
};

export function FieldDrawer({
  isOpen,
  onClose,
  onSubmit,
  editingField,
}: FieldDrawerProps) {
  const { t } = useTranslation('content');
  const form = useForm<FieldFormValues>({
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (editingField) {
      form.reset({
        label: editingField.label,
        code: editingField.code,
        type: editingField.type,
        description: editingField.description || '',
        isRequired: editingField.isRequired || false,
        options: editingField.options ? editingField.options.join(', ') : '',
      });
    } else {
      form.reset(DEFAULT_VALUES);
    }
  }, [editingField, form, isOpen]);

  const selectedFieldType = form.watch('type');
  const needsOptions = ['select', 'radio'].includes(selectedFieldType);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Sheet.View className="sm:max-w-lg p-0">
        <Sheet.Header>
          <Sheet.Title>{editingField ? t('edit-field') : t('add-field')}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-auto overflow-hidden"
          >
            <Sheet.Content className="flex flex-col gap-5 p-6 overflow-y-auto flex-auto">
              <Form.Field
                name="label"
                control={form.control}
                rules={{ required: 'Label is required' }}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('label')}</Form.Label>
                    <Form.Control>
                      <Input placeholder={t('enter-field-label')} {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                name="code"
                control={form.control}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('code')}</Form.Label>
                    <Form.Control>
                      <Input
                        placeholder={t('enter-code-field-eg')}
                        {...field}
                      />
                    </Form.Control>
                    <Form.Description>
                      {t('unique-identifier-for-this-field')}
                    </Form.Description>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                name="type"
                control={form.control}
                rules={{ required: 'Type is required' }}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('field-type')}</Form.Label>
                    <Select
                      value={field.value || ''}
                      onValueChange={field.onChange}
                    >
                      <Form.Control>
                        <Select.Trigger className="w-full">
                          <Select.Value placeholder={t('select-field-type')} />
                        </Select.Trigger>
                      </Form.Control>
                      <Select.Content>
                        {FIELD_TYPES.map((type) => (
                          <Select.Item key={type.value} value={type.value}>
                            <div className="flex items-center gap-2 [&_svg]:size-4">
                              {type.icon}
                              {type.label}
                            </div>
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                name="description"
                control={form.control}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('description')}</Form.Label>
                    <Form.Control>
                      <Textarea
                        placeholder={t('optional-description')}
                        {...field}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              {needsOptions && (
                <Form.Field
                  name="options"
                  control={form.control}
                  rules={{
                    required: needsOptions
                      ? 'Options are required for this field type'
                      : false,
                  }}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('options')}</Form.Label>
                      <Form.Control>
                        <Input
                          placeholder={t('options-placeholder')}
                          {...field}
                        />
                      </Form.Control>
                      <Form.Description>
                        {t('comma-separated-options')}
                      </Form.Description>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              )}

              <Form.Field
                name="isRequired"
                control={form.control}
                render={({ field }) => (
                  <Form.Item className="flex flex-row items-center justify-between gap-2">
                    <Form.Label className="cursor-pointer">
                      {t('required-field')}
                    </Form.Label>
                    <Form.Control>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>
                  </Form.Item>
                )}
              />
            </Sheet.Content>

            <Sheet.Footer className="border-t p-4 gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                {t('cancel')}
              </Button>
              <Button type="submit">
                {editingField ? <IconPencil /> : <IconPlus />}
                {editingField ? t('update') : t('create')}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
}

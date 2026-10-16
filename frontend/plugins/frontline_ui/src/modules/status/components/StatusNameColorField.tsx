import { StatusInlineIcon } from '@/status/components/StatusInline';
import { ColorPicker, Form, Input } from 'erxes-ui';
import { Control, FieldValues, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type TStatusNameColorFields = {
  name: string;
  color?: string;
};

export const StatusNameColorField = <
  TFieldValues extends TStatusNameColorFields,
>({
  form,
  statusType,
}: {
  form: UseFormReturn<TFieldValues>;
  statusType: number;
}) => {
  const { t } = useTranslation('frontline');
  const control = form.control as Control<FieldValues>;

  return (
    <Form.Field
      control={control}
      name="name"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('name', 'Name')}</Form.Label>
          <div className="flex items-center gap-2">
            <Form.Field
              control={control}
              name="color"
              render={({ field: colorField }) => (
                <ColorPicker.Provider
                  value={colorField.value || '#000000'}
                  onValueChange={colorField.onChange}
                >
                  <ColorPicker.Trigger
                    aria-label={t('color', 'Color')}
                    className="size-8 flex-none justify-center p-0"
                    style={{
                      backgroundColor: `${colorField.value || '#000000'}25`,
                    }}
                  >
                    <StatusInlineIcon
                      color={colorField.value}
                      statusType={statusType}
                    />
                  </ColorPicker.Trigger>
                  <ColorPicker.Content />
                </ColorPicker.Provider>
              )}
            />
            <Form.Control>
              <Input placeholder={t('name', 'Name')} {...field} />
            </Form.Control>
          </div>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

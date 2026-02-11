import { Form, Input, Textarea, ColorPicker } from 'erxes-ui';
import { useSegment } from 'ui-modules/modules/segments/context/SegmentProvider';
import { SelectSegment } from '../SelectSegment';
import { useTranslation } from 'react-i18next';

export const SegmentMetadataForm = () => {
  const { segment, form } = useSegment();
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });

  return (
    <div className="space-y-4 pb-4">
      <div className="flex flex-row gap-4">
        <Form.Field
          control={form.control}
          name="name"
          render={({ field }) => (
            <Form.Item className="flex-1">
              <Form.Label>{t('name')}</Form.Label>
              <Form.Control>
                <Input autoFocus {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="subOf"
          render={({ field }) => (
            <Form.Item className="flex-1">
              <Form.Label>{t('parent-segment')}</Form.Label>
              <Form.Control>
                <SelectSegment
                  exclude={segment?._id ? [segment._id] : undefined}
                  selected={field.value}
                  onSelect={(value) => {
                    field.onChange(field.value === value ? null : value);
                  }}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="color"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('color')}</Form.Label>
              <Form.Control>
                <ColorPicker
                  className="w-20 h-8"
                  value={field.value}
                  onValueChange={(value: string) => field.onChange(value)}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>

      <Form.Field
        control={form.control}
        name="description"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('description')}</Form.Label>
            <Form.Control>
              <Textarea {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};

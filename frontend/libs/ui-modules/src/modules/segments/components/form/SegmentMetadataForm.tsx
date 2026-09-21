import { IconInfoCircle } from '@tabler/icons-react';
import { ColorPicker, Form, Input, Select, Textarea, Tooltip } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSegment } from 'ui-modules/modules/segments/context/SegmentProvider';

export const SegmentMetadataForm = () => {
  const { form } = useSegment();
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });

  return (
    <div className="space-y-4 pb-4">
      <div className="flex flex-row items-start gap-4">
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

        <Form.Field
          control={form.control}
          name="name"
          render={({ field }) => (
            <Form.Item className="flex-1 min-w-0">
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
          name="visibility"
          render={({ field }) => (
            <Form.Item className="w-56 shrink-0">
              {/* The caveat lives in a tooltip rather than under the field:
                  it matters, but not enough to make this column taller than
                  the two beside it. */}
              <Form.Label className="flex items-center gap-1">
                {t('visibility')}
                <Tooltip.Provider>
                  <Tooltip>
                    <Tooltip.Trigger asChild>
                      <span className="text-muted-foreground">
                        <IconInfoCircle className="size-3.5" />
                      </span>
                    </Tooltip.Trigger>
                    <Tooltip.Content className="max-w-64">
                      {t('visibility-hint')}
                    </Tooltip.Content>
                  </Tooltip>
                </Tooltip.Provider>
              </Form.Label>
              <Form.Control>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger className="w-full">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="organization">
                      {t('visible-to-everyone')}
                    </Select.Item>
                    <Select.Item value="private">
                      {t('visible-to-me')}
                    </Select.Item>
                  </Select.Content>
                </Select>
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

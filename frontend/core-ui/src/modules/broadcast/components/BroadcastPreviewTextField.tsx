import { IconInfoCircle } from '@tabler/icons-react';
import { Form, Input, Tooltip } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const BroadcastPreviewTextField = () => {
  const { control } = useFormContext();
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });

  return (
    <Form.Field
      name="email.previewText"
      control={control}
      render={({ field }) => (
        <Form.Item>
          <Form.Label className="flex items-center gap-1">
            {t('previewText')}
            <Tooltip>
              <Tooltip.Trigger asChild>
                <IconInfoCircle className="size-3.5 text-muted-foreground" />
              </Tooltip.Trigger>
              <Tooltip.Content side="right" className="max-w-64">
                {t('previewTextHint')}
              </Tooltip.Content>
            </Tooltip>
          </Form.Label>
          <Form.Control>
            <Input {...field} placeholder={t('previewText')} />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

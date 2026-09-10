import { IconInfoCircle } from '@tabler/icons-react';
import { Form, Input, Tooltip } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const BroadcastPreviewTextField = () => {
  const { control } = useFormContext();
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });

  return (
    <div className="flex items-center gap-4">
      <span className="w-24 shrink-0 text-sm text-muted-foreground">
        {t('previewText')}
      </span>

      <Form.Field
        name="email.previewText"
        control={control}
        render={({ field }) => (
          <Form.Item className="flex-1">
            <Form.Control>
              <Input
                {...field}
                placeholder={t('previewText')}
                className="border-none shadow-none px-2 focus-visible:ring-0"
              />
            </Form.Control>
          </Form.Item>
        )}
      />

      <Tooltip>
        <Tooltip.Trigger asChild>
          <IconInfoCircle className="size-4 text-muted-foreground shrink-0" />
        </Tooltip.Trigger>
        <Tooltip.Content side="left" className="max-w-64">
          {t('previewTextHint')}
        </Tooltip.Content>
      </Tooltip>
    </div>
  );
};

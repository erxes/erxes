import { IconSettings } from '@tabler/icons-react';
import { Button, Form, Popover } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { BroadcastAttachment } from './BroadcastAttachment';

export const BroadcastComposerSettings = () => {
  const { control } = useFormContext();
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="secondary" size="icon" type="button" aria-label={t('settings')}>
          <IconSettings />
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-80" align="start">
        <Form.Field
          name="email.attachments"
          control={control}
          render={({ field }) => (
            <Form.Item className="h-full overflow-hidden">
              <Form.Label>{t('attachments')}</Form.Label>
              <Form.Control>
                <BroadcastAttachment {...field} />
              </Form.Control>
            </Form.Item>
          )}
        />
      </Popover.Content>
    </Popover>
  );
};

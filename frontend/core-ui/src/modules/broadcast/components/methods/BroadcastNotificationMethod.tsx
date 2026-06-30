import { IconBellRinging, IconDeviceMobile } from '@tabler/icons-react';
import { cn, Form, Input, Label, Textarea } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const BroadcastNotificationMethod = () => {
  const { t } = useTranslation('broadcasts');
  const { control } = useFormContext();

  return (
    <form className="flex flex-col h-full gap-3">
      <div className="grid grid-cols-2 gap-3 pb-2">
        <Form.Field
          name="notification.inApp"
          control={control}
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <div
                  className={cn(
                    'flex h-full cursor-pointer flex-col items-center gap-3 rounded-sm border-2 p-3 text-center transition-colors',
                    field.value
                      ? 'border-primary bg-muted'
                      : 'hover:border-primary hover:bg-muted',
                  )}
                >
                  <IconBellRinging className="text-muted-foreground" />
                  <Label className="cursor-pointer">
                    {t('in-app-notification', 'In-app push notification')}
                  </Label>
                </div>
              </Form.Control>
            </Form.Item>
          )}
        />

        <Form.Field
          name="notification.isMobile"
          control={control}
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <div
                  className={cn(
                    'flex h-full cursor-pointer flex-col items-center gap-3 rounded-sm border-2 p-3 text-center transition-colors',
                    field.value
                      ? 'border-primary bg-muted'
                      : 'hover:border-primary hover:bg-muted',
                  )}
                  onClick={() => {
                    field.onChange(!field.value);
                  }}
                >
                  <IconDeviceMobile className="text-muted-foreground" />
                  <Label className="cursor-pointer">
                    {t('mobile-web-notification', 'Mobile & Web push notification')}
                  </Label>
                </div>
              </Form.Control>
            </Form.Item>
          )}
        />
      </div>
      <Form.Field
        name="notification.title"
        control={control}
        render={({ field }) => (
          <Form.Item>
            <div className="flex items-center justify-between">
              <Form.Label>{t('notification-title', 'Notification title')}</Form.Label>
              <Form.Label>15</Form.Label>
            </div>
            <Form.Control>
              <Input {...field} placeholder={t('title', 'Title')} maxLength={15} />
            </Form.Control>
          </Form.Item>
        )}
      />
      <Form.Field
        name="notification.message"
        control={control}
        render={({ field }) => (
          <Form.Item>
            <div className="flex items-center justify-between">
              <Form.Label>{t('notification-content', 'Notification content')}</Form.Label>
              <Form.Label>160</Form.Label>
            </div>
            <Form.Control>
              <Textarea
                {...field}
                placeholder={t('content', 'Content')}
                maxLength={160}
                rows={10}
              />
            </Form.Control>
          </Form.Item>
        )}
      />
    </form>
  );
};

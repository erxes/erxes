import { useClientPortals } from '@/client-portal/hooks/useClientPortals';
import { IconBellRinging, IconDeviceMobile } from '@tabler/icons-react';
import { cn, Form, Input, Label, Select, Textarea } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const BroadcastNotificationMethod = () => {
  const { t } = useTranslation('broadcasts');
  const { control, watch } = useFormContext();
  const { clientPortals, loading } = useClientPortals();

  const title = watch('notification.title') || '';
  const content = watch('notification.content') || '';

  return (
    <form className="flex flex-col h-full gap-3">
      <Form.Field
        name="cpId"
        control={control}
        rules={{ required: 'Client portal is required' }}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Client portal</Form.Label>
            <Select onValueChange={field.onChange} value={field.value}>
              <Form.Control>
                <Select.Trigger>
                  <Select.Value placeholder="Select client portal">
                    {clientPortals?.find((portal) => portal._id === field.value)
                      ?.name || 'Select client portal'}
                  </Select.Value>
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                <Select.Group>
                  {loading ? (
                    <Select.Item value="loading" disabled>
                      Loading...
                    </Select.Item>
                  ) : clientPortals?.length ? (
                    clientPortals.map((portal) => (
                      <Select.Item
                        key={portal._id}
                        className="text-xs h-7"
                        value={portal._id || ''}
                      >
                        {portal.name}
                      </Select.Item>
                    ))
                  ) : (
                    <Select.Item value="empty" disabled>
                      No client portals found
                    </Select.Item>
                  )}
                </Select.Group>
              </Select.Content>
            </Select>
            <Form.Message />
          </Form.Item>
        )}
      />

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
                  onClick={() => {
                    field.onChange(!field.value);
                  }}
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
        rules={{ required: 'Notification title is required' }}
        render={({ field }) => (
          <Form.Item>
            <div className="flex items-center justify-between">
              <Form.Label>{t('notification-title', 'Notification title')}</Form.Label>
              <Form.Label className="text-muted-foreground font-normal">
                {title.length}/15
              </Form.Label>
            </div>
            <Form.Control>
              <Input {...field} placeholder={t('title', 'Title')} maxLength={15} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        name="notification.content"
        control={control}
        rules={{ required: 'Notification content is required' }}
        render={({ field }) => (
          <Form.Item>
            <div className="flex items-center justify-between">
              <Form.Label>{t('notification-content', 'Notification content')}</Form.Label>
              <Form.Label className="text-muted-foreground font-normal">
                {content.length}/160
              </Form.Label>
            </div>
            <Form.Control>
              <Textarea
                {...field}
                placeholder={t('content', 'Content')}
                maxLength={160}
                rows={10}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </form>
  );
};

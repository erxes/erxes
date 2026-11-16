import { BroadcastFromAddress } from '@/broadcast/components/BroadcastFromAddress';
import { useBroadcastFromField } from '@/broadcast/hooks/useBroadcastFromField';
import { IconInfoCircle, IconLock } from '@tabler/icons-react';
import { Form, Input, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

const LABEL_CLASS =
  'font-mono text-xs font-semibold uppercase text-accent-foreground';

export const BroadcastFromField = () => {
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });
  const {
    control,
    sender,
    isLocked,
    isDomainPicker,
    senderRules,
    fromRules,
    lockedMessage,
    showSettingsLink,
  } = useBroadcastFromField();

  if (sender.loading) {
    return (
      <div className="space-y-2">
        <span className={LABEL_CLASS}>{t('from')}</span>
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className={LABEL_CLASS}>
        {t('from')}
        <span className="text-destructive">*</span>
      </span>

      <div className="grid grid-cols-[2fr_3fr] gap-2">
        <Form.Field
          name="email.sender"
          control={control}
          rules={senderRules}
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <Input
                  {...field}
                  placeholder={t('sender-placeholder')}
                  aria-label={t('sender-name')}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        {isLocked ? (
          <div className="flex h-7 min-w-0 items-center gap-1.5 rounded-sm bg-muted px-3 text-sm text-muted-foreground">
            <IconLock className="size-3.5 shrink-0" />
            <span className="truncate">{sender.lockedAddress}</span>
          </div>
        ) : (
          <Form.Field
            name="fromEmail"
            control={control}
            rules={fromRules}
            render={({ field }) => (
              <Form.Item>
                {isDomainPicker ? (
                  <BroadcastFromAddress
                    value={field.value}
                    onChange={field.onChange}
                    domains={sender.domains}
                    fallbackAddress={sender.defaultSenderEmail}
                  />
                ) : (
                  <Form.Control>
                    <Input {...field} placeholder="sales@yourdomain.com" />
                  </Form.Control>
                )}
                <Form.Message />
              </Form.Item>
            )}
          />
        )}
      </div>

      {isLocked && (
        <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <IconInfoCircle className="size-3.5 shrink-0" />
          {lockedMessage}
          {showSettingsLink && (
            <Link
              to={sender.settingsPath}
              target="_blank"
              className="text-primary hover:underline"
            >
              {t('from-locked-settings')}
            </Link>
          )}
        </p>
      )}
    </div>
  );
};

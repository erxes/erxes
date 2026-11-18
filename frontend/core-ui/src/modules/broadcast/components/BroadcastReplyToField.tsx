import { useBroadcastReplyTo } from '@/broadcast/hooks/useBroadcastReplyTo';
import { useBroadcastSender } from '@/broadcast/hooks/useBroadcastSender';
import { SelectVerifiedSender } from '@/settings/mail-config/components/SelectVerifiedSender';
import { IconArrowBackUp, IconX } from '@tabler/icons-react';
import { Button, Form, Input } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  useLockedReplyTo,
  useReplyToEmailRule,
} from '../hooks/useBroadcastReplyToField';

/**
 * While the From is locked to the default sender, the confirmed address picked
 * here is who the mail speaks for, so it is required and lands in fromEmail.
 */
const LockedReplyTo = ({ canVerifySenders }: { canVerifySenders: boolean }) => {
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });
  const { control, rules, pickAddress } = useLockedReplyTo();

  return (
    <Form.Field
      name="fromEmail"
      control={control}
      rules={rules}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            {t('replyTo')}
            <span className="text-destructive">*</span>
          </Form.Label>
          <Form.Control>
            {canVerifySenders ? (
              <SelectVerifiedSender
                value={field.value}
                onChange={pickAddress(field.onChange)}
                placeholder={t('reply-to-placeholder')}
              />
            ) : (
              <Input {...field} placeholder={t('reply-to-input-placeholder')} />
            )}
          </Form.Control>
          <Form.Description className="flex items-center gap-1 text-xs">
            <IconArrowBackUp className="size-3.5 shrink-0" />
            {t('replies-go-to-picked')}
          </Form.Description>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

const OptionalReplyTo = ({
  canVerifySenders,
  domains,
}: {
  canVerifySenders: boolean;
  domains: string[];
}) => {
  const { control } = useFormContext();
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });
  const { open, ask, clear, fromEmail } = useBroadcastReplyTo();
  const validateEmail = useReplyToEmailRule();

  if (!open) {
    return (
      <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <IconArrowBackUp className="size-3.5 shrink-0" />
        {fromEmail
          ? t('replies-go-to', { address: fromEmail })
          : t('replies-go-to-from')}
        <span aria-hidden="true">·</span>
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto p-0 text-xs"
          onClick={ask}
        >
          {t('reply-elsewhere')}
        </Button>
      </p>
    );
  }

  return (
    <Form.Field
      name="email.replyTo"
      control={control}
      rules={{ validate: validateEmail }}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('replyTo')}</Form.Label>
          <div className="flex items-center gap-1">
            <div className="min-w-0 flex-1">
              <Form.Control>
                {canVerifySenders ? (
                  <SelectVerifiedSender
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={t('reply-to-pick-placeholder')}
                    allowDomains={domains}
                  />
                ) : (
                  <Input
                    {...field}
                    placeholder={t('reply-to-input-placeholder')}
                  />
                )}
              </Form.Control>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clear}
              aria-label={t('reply-to-remove')}
            >
              <IconX />
            </Button>
          </div>
          {canVerifySenders && domains.length > 0 && (
            <Form.Description className="text-xs">
              {t('reply-to-rule', { domains: domains.join(', ') })}
            </Form.Description>
          )}
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

export const BroadcastReplyToField = () => {
  const { mode, canVerifySenders, domains, loading } = useBroadcastSender();

  // the From field above already stands in while the options load
  if (loading) {
    return null;
  }

  if (mode === 'locked') {
    return <LockedReplyTo canVerifySenders={canVerifySenders} />;
  }

  return (
    <OptionalReplyTo canVerifySenders={canVerifySenders} domains={domains} />
  );
};

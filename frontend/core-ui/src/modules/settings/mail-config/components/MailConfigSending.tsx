import { IconLoader2 } from '@tabler/icons-react';
import { Button, Form } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { FromDomainStatus } from '@/settings/mail-config/components/FromDomainStatus';
import { MailConfigField } from '@/settings/mail-config/components/MailConfigField';
import { MailConfigHeading } from '@/settings/mail-config/components/MailConfigHeading';
import { useMailSendingForm } from '@/settings/mail-config/hooks/useMailSendingForm';

export const MailConfigSending = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'mail-config' });
  const { methods, fields, submitHandler, isLoading } = useMailSendingForm();

  return (
    <>
      <MailConfigHeading
        title={t('view-sending')}
        description={t('sending-desc')}
      />
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit(submitHandler)}
          className="grid grid-cols-2 gap-x-3 gap-y-5"
        >
          {fields.map((input) => (
            <MailConfigField key={input.name} input={input} />
          ))}

          <FromDomainStatus className="col-span-2" />

          <div className="col-span-2 flex justify-end">
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading && <IconLoader2 className="animate-spin" />}
              {t('update')}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

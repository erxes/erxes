import { IconLoader2 } from '@tabler/icons-react';
import { Button, Form, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { MailConfigField } from '@/settings/mail-config/components/MailConfigField';
import { MailConfigHeading } from '@/settings/mail-config/components/MailConfigHeading';
import { useMailTemplateForm } from '@/settings/mail-config/hooks/useMailTemplateForm';

export const MailConfigTemplate = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'mail-config' });
  const {
    methods,
    templateFields,
    postalFields,
    postalMissing,
    submitHandler,
    isLoading,
  } = useMailTemplateForm();

  return (
    <>
      <MailConfigHeading
        title={t('view-template')}
        description={t('template-view-desc')}
      />
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit(submitHandler)}
          className="grid grid-cols-2 gap-x-3 gap-y-5"
        >
          {templateFields.map((input) => (
            <MailConfigField key={input.name} input={input} />
          ))}

          <Separator className="col-span-2" />
          <h3 className="col-span-2 text-sm font-semibold">{t('footer')}</h3>

          {postalFields.map((input) => (
            <MailConfigField key={input.name} input={input} />
          ))}

          {postalMissing && (
            <div className="col-span-2 p-3 text-sm leading-[140%] font-normal bg-warning/6 text-warning rounded-lg border border-warning/30">
              {t('postal-address-missing')}
            </div>
          )}

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

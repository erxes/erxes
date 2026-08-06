import { useEffect, useMemo } from 'react';
import { useMailConfigForm } from '@/settings/mail-config/hooks/useMailConfigForm';
import { Button, Form, Input, Select, cn } from 'erxes-ui';
import { MAIL_CONFIG_FIELDS } from '@/settings/mail-config/constants/formData';
import { TMailConfigForm } from '@/settings/mail-config/types';
import { Path, useWatch } from 'react-hook-form';
import { AnimatePresence } from 'framer-motion';
import { useConfig } from '@/settings/file-upload/hook/useConfigs';
import { VerifiedSenders } from '@/settings/mail-config/components/VerifiedSenders';
import { IconLoader2 } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

const MailConfigForm = () => {
  const {
    methods: { control },
    methods,
    submitHandler,
  } = useMailConfigForm();
  const { isLoading, configs } = useConfig();
  const { t } = useTranslation('settings', {
    keyPrefix: 'mail-config',
  });
  const COMPANY_EMAIL_TEMPLATE_TYPE = useWatch({
    control,
    name: 'COMPANY_EMAIL_TEMPLATE_TYPE',
  });
  const MAIL_SERVICE = useWatch({ control, name: 'DEFAULT_EMAIL_SERVICE' });
  const POSTAL_ADDRESS = useWatch({ control, name: 'COMPANY_POSTAL_ADDRESS' });

  useEffect(() => {
    if (!configs) {
      methods.reset({
        DEFAULT_EMAIL_SERVICE: 'SES',
      });
      return;
    }

    const values = configs.reduce(
      (acc: Record<string, string>, config: any) => {
        acc[config.code] = config.value;
        return acc;
      },
      {},
    );

    methods.reset({
      ...values,
      DEFAULT_EMAIL_SERVICE: values.DEFAULT_EMAIL_SERVICE ?? 'SES',
    });
  }, [configs, methods]);
  const columns = useMemo(() => MAIL_CONFIG_FIELDS(t), [t]);

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit(submitHandler)}
        className="grid grid-cols-4 gap-3 py-1"
      >
        {columns['common'].map(
          (
            { name, inputType, type, label, description, options, className },
            idx,
          ) => {
            if (inputType === 'select') {
              return (
                <Form.Field
                  key={name}
                  control={control}
                  name={name as Path<TMailConfigForm>}
                  render={({ field }) => (
                    <Form.Item
                      className={cn(
                        idx === 1 ? 'col-span-2' : 'col-span-4',
                        'flex flex-col justify-between',
                      )}
                    >
                      <div>
                        <Form.Label>{label}</Form.Label>
                        <Form.Description>{description}</Form.Description>
                      </div>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <Form.Control>
                          <Select.Trigger
                            className={cn(idx === 1 && 'capitalize', 'h-7')}
                          >
                            <Select.Value placeholder={'Select type'} />
                          </Select.Trigger>
                        </Form.Control>
                        <Select.Content>
                          {options?.map((opt) => (
                            <Select.Item key={opt} value={opt}>
                              {opt}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </Form.Item>
                  )}
                />
              );
            } else if (inputType === 'editor') {
              if (COMPANY_EMAIL_TEMPLATE_TYPE === 'simple') {
                return (
                  <Form.Field
                    key={name}
                    control={control}
                    name={name as Path<TMailConfigForm>}
                    render={({ field }) => (
                      <Form.Item
                        className={cn(
                          idx === 0 ? 'col-span-2' : 'col-span-4',
                          'flex flex-col justify-between',
                        )}
                      >
                        <div>
                          <Form.Label>{label}</Form.Label>
                        </div>
                        <div className="w-full flex items-center p-3 text-sm leading-[140%] font-normal bg-primary/6 text-primary rounded-lg border border-primary/30">
                          {description}
                        </div>
                      </Form.Item>
                    )}
                  />
                );
              } else {
                return (
                  <Form.Field
                    key={name}
                    control={control}
                    name={name as Path<TMailConfigForm>}
                    render={({ field }) => (
                      <Form.Item
                        className={cn(
                          idx === 0 ? 'col-span-2' : 'col-span-4',
                          'flex flex-col justify-between',
                        )}
                      >
                        <div>
                          <Form.Label>{label}</Form.Label>
                        </div>
                        <div className="w-full flex items-center p-3 text-sm leading-[140%] font-normal bg-primary/6 text-primary rounded-lg border border-primary/30">
                          {description}
                        </div>
                      </Form.Item>
                    )}
                  />
                );
              }
            }
            return (
              <Form.Field
                key={name}
                control={control}
                name={name as Path<TMailConfigForm>}
                render={({ field }) => (
                  <Form.Item
                    className={cn(
                      className ?? (idx === 0 ? 'col-span-2' : 'col-span-4'),
                      'flex flex-col justify-between',
                    )}
                  >
                    <div>
                      <Form.Label>{label}</Form.Label>
                      <Form.Description>{description}</Form.Description>
                    </div>
                    <Form.Control>
                      <Input type={type} {...field} className="h-7" />
                    </Form.Control>
                  </Form.Item>
                )}
              />
            );
          },
        )}
        {!POSTAL_ADDRESS && (
          <div className="col-span-4 p-3 text-sm leading-[140%] font-normal bg-warning/6 text-warning rounded-lg border border-warning/30">
            {t('postal-address-missing')}
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {columns[MAIL_SERVICE]?.map(
            ({ name, inputType, type, label, description, options }, idx) => (
              <Form.Field
                key={name}
                control={control}
                name={name as Path<TMailConfigForm>}
                render={({ field }) => (
                  <Form.Item
                    className={cn(
                      methods.watch('DEFAULT_EMAIL_SERVICE') === 'custom' &&
                        'last-of-type:col-span-4',
                      'flex flex-col justify-between col-span-2 last-of-type:col-span-2',
                    )}
                  >
                    <div>
                      <Form.Label>{label}</Form.Label>
                      <Form.Description>{description}</Form.Description>
                    </div>
                    <Form.Control>
                      <Input type={type} {...field} className="h-7" />
                    </Form.Control>
                  </Form.Item>
                )}
              />
            ),
          )}
        </AnimatePresence>

        <Form.Item className="col-span-4 flex flex-col justify-between">
          <div>
            <Form.Label>{t('verified-senders')}</Form.Label>
            <Form.Description>{t('verified-senders-desc')}</Form.Description>
          </div>
          <VerifiedSenders />
        </Form.Item>

        <Form.Item className="col-span-4 grid grid-cols-4">
          <Button
            size={'sm'}
            type="submit"
            className="w-full col-span-1 col-start-4"
          >
            {isLoading ? <IconLoader2 className="animate-spin" /> : 'Update'}
          </Button>
        </Form.Item>
      </form>
    </Form>
  );
};

export { MailConfigForm };

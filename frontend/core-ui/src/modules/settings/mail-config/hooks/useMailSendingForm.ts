import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@/settings/file-upload/hook/useConfigs';
import { MAIL_CONFIG_FIELDS } from '@/settings/mail-config/constants/formData';
import { MAIL_SENDING_SCHEMA } from '@/settings/mail-config/schema';
import { TMailSendingForm } from '@/settings/mail-config/types';
import { toFormValues } from '@/settings/mail-config/utils/toFormValues';

const SENDING_CODES = [
  'COMPANY_EMAIL_FROM',
  'DEFAULT_EMAIL_SERVICE',
  'MAIL_SERVICE',
  'MAIL_PORT',
  'MAIL_USER',
  'MAIL_PASS',
  'MAIL_HOST',
  'AWS_SES_ACCESS_KEY_ID',
  'AWS_SES_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'AWS_SES_CONFIG_SET',
  'SENDGRID_API_KEY',
  'SENDGRID_SUBUSER',
  'SENDGRID_WEBHOOK_PUBLIC_KEY',
];

const toSendingForm = (values: Record<string, string>) =>
  ({
    ...values,
    DEFAULT_EMAIL_SERVICE: values.DEFAULT_EMAIL_SERVICE || 'SES',
  } as TMailSendingForm);

export const useMailSendingForm = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'mail-config' });
  const { configs, updateConfig, isLoading } = useConfig();

  const methods = useForm<TMailSendingForm>({
    mode: 'onBlur',
    resolver: zodResolver(MAIL_SENDING_SCHEMA),
    defaultValues: toSendingForm(toFormValues([], SENDING_CODES)),
  });

  useEffect(() => {
    if (configs) {
      methods.reset(toSendingForm(toFormValues(configs, SENDING_CODES)));
    }
  }, [configs, methods]);

  const service = useWatch({
    control: methods.control,
    name: 'DEFAULT_EMAIL_SERVICE',
  });

  const fields = useMemo(() => {
    const groups = MAIL_CONFIG_FIELDS(t);

    return [...groups.sending, ...(groups[service] || [])];
  }, [t, service]);

  const submitHandler: SubmitHandler<TMailSendingForm> = (data) =>
    updateConfig(data);

  return { methods, fields, submitHandler, isLoading };
};

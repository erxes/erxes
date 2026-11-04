import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@/settings/file-upload/hook/useConfigs';
import { MAIL_CONFIG_FIELDS } from '@/settings/mail-config/constants/formData';
import { MAIL_TEMPLATE_SCHEMA } from '@/settings/mail-config/schema';
import { TMailTemplateForm } from '@/settings/mail-config/types';
import { toFormValues } from '@/settings/mail-config/utils/toFormValues';

const TEMPLATE_CODES = [
  'COMPANY_EMAIL_TEMPLATE_TYPE',
  'COMPANY_EMAIL_TEMPLATE',
  'COMPANY_POSTAL_ADDRESS',
  'COMPANY_POSTAL_CITY',
  'COMPANY_POSTAL_COUNTRY',
];

const toTemplateForm = (values: Record<string, string>): TMailTemplateForm => ({
  ...values,
  COMPANY_EMAIL_TEMPLATE_TYPE: values.COMPANY_EMAIL_TEMPLATE_TYPE || 'simple',
});

export const useMailTemplateForm = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'mail-config' });
  const { configs, updateConfig, isLoading } = useConfig();

  const methods = useForm<TMailTemplateForm>({
    mode: 'onBlur',
    resolver: zodResolver(MAIL_TEMPLATE_SCHEMA),
    defaultValues: toTemplateForm(toFormValues([], TEMPLATE_CODES)),
  });

  useEffect(() => {
    if (configs) {
      methods.reset(toTemplateForm(toFormValues(configs, TEMPLATE_CODES)));
    }
  }, [configs, methods]);

  const postalAddress = useWatch({
    control: methods.control,
    name: 'COMPANY_POSTAL_ADDRESS',
  });

  const { templateFields, postalFields } = useMemo(() => {
    const groups = MAIL_CONFIG_FIELDS(t);

    return { templateFields: groups.template, postalFields: groups.postal };
  }, [t]);

  const submitHandler: SubmitHandler<TMailTemplateForm> = (data) =>
    updateConfig(data);

  return {
    methods,
    templateFields,
    postalFields,
    postalMissing: !postalAddress?.trim(),
    submitHandler,
    isLoading,
  };
};

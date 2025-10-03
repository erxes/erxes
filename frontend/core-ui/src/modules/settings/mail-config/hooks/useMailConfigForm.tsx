import { SubmitHandler, useForm } from 'react-hook-form';
import {
  TCustomMailConfig,
  TSESMailConfig,
} from '@/settings/mail-config/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { MAIL_CONFIG_SCHEMA } from '@/settings/mail-config/schema';
import { useCallback } from 'react';
import { useConfig } from '@/settings/file-upload/hook/useConfigs';

type TProps = TCustomMailConfig | TSESMailConfig;

interface TConfig {
  _id: string;
  code: keyof TProps;
  value: any;
}

const useMailConfigForm = () => {
  const { updateConfig, configs } = useConfig();
  const methods = useForm<TProps>({
    mode: 'onBlur',
    resolver: zodResolver(MAIL_CONFIG_SCHEMA),
    defaultValues: {
      COMPANY_EMAIL_FROM: '',
      COMPANY_EMAIL_TEMPLATE_TYPE: 'simple',
      COMPANY_EMAIL_TEMPLATE: '',
      DEFAULT_EMAIL_SERVICE: 'SES',

      MAIL_SERVICE: '',
      MAIL_PORT: '',
      MAIL_USER: '',
      MAIL_PASS: '',
      MAIL_HOST: '',

      AWS_SES_ACCESS_KEY_ID: '',
      AWS_SES_SECRET_ACCESS_KEY: '',
      AWS_REGION: '',
      AWS_SES_CONFIG_SET: '',
    } as TProps,
  });

  const submitHandler: SubmitHandler<TProps> = useCallback(async (data) => {
    const updatedConfigs: Record<string, any> = {};

    Object.entries(data).forEach(([key, value]) => {
      updatedConfigs[key] = value;
    });

    updateConfig(updatedConfigs);
  }, []);

  return {
    methods,
    submitHandler,
  };
};

export { useMailConfigForm };

import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import en from './locales/conversion.en.json';
import mn from './locales/conversion.mn.json';

const conversionResources: Record<string, Record<keyof typeof en, string>> = {
  en,
  mn,
};

const errorKeys: Record<string, keyof typeof en> = {
  TRANSACTIONS_REQUIRED: 'transactionsRequired',
  FORM_CHANGED: 'formChanged',
  VALIDATION_TIMEOUT: 'timeout',
  INVALID_VALIDATOR: 'invalidValidator',
  STALE_FIELD: 'stale',
  FIELD_NOT_FOUND: 'missing',
  UNSUPPORTED_TYPE: 'unsupported',
  LINKED_FIELD: 'linked',
  DUPLICATE_MAPPING: 'duplicate',
  CONDITIONAL_RULES: 'logics',
  INCOMPATIBLE_ANSWERS: 'changedAnswers',
};

const typeKeys: Record<string, keyof typeof en> = {
  text: 'text',
  input: 'text',
  textarea: 'textarea',
  number: 'number',
  date: 'date',
  'core:customer:firstName': 'firstName',
  'core:customer:middleName': 'middleName',
  'core:customer:lastName': 'lastName',
  'core:customer:description': 'description',
  'core:customer:email': 'email',
  'core:customer:phone': 'phone',
  'core:customer:birthDate': 'birthDate',
};

export const useFormConversionTranslation = () => {
  const { i18n } = useTranslation();
  for (const [language, resources] of Object.entries(conversionResources)) {
    if (!i18n.hasResourceBundle(language, 'frontline-form-conversion')) {
      i18n.addResourceBundle(language, 'frontline-form-conversion', resources);
    }
  }
  const t = (
    key: keyof typeof en,
    values: Record<string, string | number> = {},
  ): string =>
    i18n.t(key, {
      ...values,
      ns: 'frontline-form-conversion',
      defaultValue: en[key],
    });
  return {
    t,
    fieldType: (type: string): string =>
      t(type.startsWith('core:customer:') ? 'customer' : 'basic', {
        type: typeKeys[type] ? t(typeKeys[type]) : type,
      }),
    errorMessage: (error: unknown): string | undefined => {
      if (!(error instanceof ApolloError)) return undefined;
      const details = error.graphQLErrors.find(
        (item) => item.extensions?.code === 'FORM_FIELD_CONVERSION',
      )?.extensions;
      if (!details) return undefined;
      const reason = typeof details.reason === 'string' ? details.reason : '';
      return t(errorKeys[reason] ?? 'unavailable', {
        fieldName:
          typeof details.fieldName === 'string' ? details.fieldName : '',
      });
    },
  };
};

import { Form } from 'erxes-ui';
import FormField from '@/settings/profile/components/fields/FormField';
import { FormType } from '@/settings/profile/hooks/useProfileForm';
import { useTranslation } from 'react-i18next';

const DefaultFields = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'profile',
  });
  return (
    <div className="grid grid-cols-2 gap-6 mt-0.5">
      <div className="flex flex-col gap-2">
        <Form.Label className="text-xs">{t('username')}</Form.Label>
        <FormField
          name={'username' as keyof FormType}
          element="input"
          attributes={{
            type: 'text',
            placeholder: t('username-placeholder'),
          }}
        />
      </div>
      <div className="flex flex-col gap-2 col-start-1">
        <Form.Label className="text-xs">{t('firstname')}</Form.Label>
        <FormField
          name={'details.firstName' as keyof FormType}
          element="input"
          attributes={{
            type: 'text',
            placeholder: t('firstname-placeholder'),
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Form.Label className="text-xs">{t('lastname')}</Form.Label>
        <FormField
          name={'details.lastName' as keyof FormType}
          element="input"
          attributes={{
            type: 'text',
            placeholder: t('lastname-placeholder'),
          }}
        />
      </div>
    </div>
  );
};

export default DefaultFields;
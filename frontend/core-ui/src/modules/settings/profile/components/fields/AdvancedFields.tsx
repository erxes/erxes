import FormField from '@/settings/profile/components/fields/FormField';
import { PositionField } from '@/settings/profile/components/fields/PositionField';
import { PROFILE_ADVANCED_FIELDS } from '@/settings/profile/constants/profileFields';
import { FormType } from '@/settings/profile/hooks/useProfileForm';
import { Accordion, Form } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

const AdvancedFields = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'profile',
  });
  const columns = useMemo(() => PROFILE_ADVANCED_FIELDS(t), [t]);

  return (
    <Accordion type="single" collapsible className="w-full">
      <Accordion.Item className="py-0 border-b-0" value="advanced">
        <Accordion.Trigger className="flex flex-1 items-center justify-between py-0 text-left font-normal leading-6 transition-all [&[data-state=open]>svg]:rotate-180 hover:no-underline">
          <div className="flex flex-col gap-3">
            <Form.Label>{t('more-information')}</Form.Label>
            <Form.Description>
              {t('more-information-description')}
            </Form.Description>
          </div>
        </Accordion.Trigger>
        <Accordion.Content className="py-3 gap-3">
          <div className="grid grid-cols-2 gap-6">
            <PositionField />
            {columns.map((advancedField, index) => {
              const {
                fieldLabel,
                fieldName,
                fieldPath,
                field: { element, attributes = {} },
              } = advancedField;

              const pathName = fieldPath
                ? [fieldPath, fieldName].join('.')
                : fieldName;

              return (
                <div
                  className="flex flex-col gap-2"
                  key={`advanced-field-${index}`}
                >
                  <Form.Label className="text-xs">{fieldLabel}</Form.Label>
                  <FormField
                    name={pathName as keyof FormType}
                    element={element}
                    attributes={attributes}
                  />
                </div>
              );
            })}
          </div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
};

export default AdvancedFields;

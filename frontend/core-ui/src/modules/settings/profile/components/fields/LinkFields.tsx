import { ToggleGroup } from 'erxes-ui';
import { PROFILE_LINK_FIELDS } from '@/settings/profile/constants/profileFields';
import FormField from '@/settings/profile/components/fields/FormField';
import { FormType } from '@/settings/profile/hooks/useProfileForm';
import { useFormContext } from 'react-hook-form';
import { useState } from 'react';

const LinkFields = () => {
  const form = useFormContext<FormType>();
  const [currentLink, setCurrentLink] = useState<string>('');
  return (
    <div className="flex gap-1">
      <ToggleGroup
        type="single"
        variant="outline"
        size={'lg'}
        onValueChange={(selectedItem) => {
          setCurrentLink(selectedItem);
        }}
      >
        {PROFILE_LINK_FIELDS.map((linkField, index) => {
          const { fieldName, fieldPath, icon: Icon } = linkField;

          const field = form.getFieldState(
            [fieldPath, fieldName].join('.') as keyof FormType,
          );

          return (
            <ToggleGroup.Item
              value={fieldName}
              aria-label="Toggle bold"
              key={`toggle-item-${index}`}
              className={`${field.error && 'border-red-500'} w-10`}
              onDoubleClick={() => {
                const rawValue = form.getValues(
                  [fieldPath, fieldName].join('.') as keyof FormType,
                );

                if (typeof rawValue === 'string' && rawValue.trim()) {
                  const trimmed = rawValue.trim();

                  const url =
                    fieldName === 'discord' && /^\d{17,19}$/.test(trimmed)
                      ? `https://discord.com/users/${trimmed}`
                      : trimmed.startsWith('http')
                      ? trimmed
                      : `https://${trimmed}`;

                  window.open(url, '_blank');
                }
              }}
            >
              <Icon className={`h-4 w-4 ${field.error && 'text-rose-600'}`} />
            </ToggleGroup.Item>
          );
        })}
      </ToggleGroup>

      {currentLink && (
        <div className="flex-grow">
          <FormField
            name={`links.${currentLink}` as keyof FormType}
            element="input"
            attributes={{
              type: 'text',
              placeholder: `Enter ${currentLink}`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default LinkFields;

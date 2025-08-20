import GenerateField from '@erxes/ui-forms/src/settings/properties/components/GenerateField';
import { SidebarContent } from '@erxes/ui-forms/src/settings/properties/styles';
import Button from '@erxes/ui/src/components/Button';
import React from 'react';
import { IPostTranslation, IWebSite } from '../../types';

type CustomField = {
  field: string;
  value: Record<string, any>[]; // array of key-value objects
};

type Props = {
  clientPortalId: string;
  customFieldsData?: CustomField[];
  website: IWebSite;
  currentLanguage: string;
  translations: IPostTranslation[];
  setTranslations: (translations: IPostTranslation[]) => void;
  group: any;
  onChange: (field: string, value: any) => void;
};

const CustomPostTypeFields = (props: Props) => {
  const { group, website, currentLanguage, customFieldsData, translations } = props;

  const isDefaultLanguage = currentLanguage === website.language;

  const [localData, setLocalData] = React.useState<CustomField[]>([]);
  const [hasChanges, setHasChanges] = React.useState(false);

  // Sync localData whenever language or incoming props change
  React.useEffect(() => {
    if (isDefaultLanguage) {
      setLocalData(customFieldsData || []);
    } else {
      const translation = translations.find((t) => t.language === currentLanguage);
      setLocalData(translation?.customFieldsData || []);
    }
    setHasChanges(false);
  }, [customFieldsData, translations, currentLanguage, isDefaultLanguage]);

  const onChangeValue = ({ _id, value }: { _id: string; value: any }) => {
    const fieldIndex = localData.findIndex((f) => f.field === _id);
    let updatedFields: CustomField[];

    if (fieldIndex !== -1) {
      // Update existing field
      updatedFields = localData.map((f, i) =>
        i === fieldIndex ? { ...f, value } : f
      );
    } else {
      // Add new field
      updatedFields = [...localData, { field: _id, value }];
    }

    setLocalData(updatedFields);
    setHasChanges(true);

    if (isDefaultLanguage) {
      props.onChange('customFieldsData', updatedFields);
    } else {
      props.setTranslations((prev) => {
        const exists = prev.find((t) => t.language === currentLanguage);

        if (exists) {
          return prev.map((t) =>
            t.language === currentLanguage
              ? { ...t, customFieldsData: updatedFields }
              : t
          );
        }

        return [
          ...prev,
          {
            language: currentLanguage,
            title: '',
            content: '',
            excerpt: '',
            postId: '',
            type: '',
            customFieldsData: updatedFields,
          },
        ];
      });
    }
  };

  const handleCancel = () => {
    if (isDefaultLanguage) {
      setLocalData(customFieldsData || []);
    } else {
      const translation = translations.find((t) => t.language === currentLanguage);
      setLocalData(translation?.customFieldsData || []);
    }
    setHasChanges(false);
  };

  return (
    <SidebarContent>
      {group.fields.map((field: any) => {
        const existingField = localData.find((f) => f.field === field._id);
        return (
          <GenerateField
            key={`${currentLanguage}-${field._id}`}
            field={field}
            onValueChange={onChangeValue}
            defaultValue={existingField?.value ?? []} // because value is always an array
          />
        );
      })}

      {hasChanges && (
        <div
          style={{
            display: 'flex',
            gap: '10px',
            padding: '10px',
            borderTop: '1px solid #eee',
            marginTop: '10px',
          }}
        >
          <Button btnStyle="simple" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      )}
    </SidebarContent>
  );
};

export default CustomPostTypeFields;

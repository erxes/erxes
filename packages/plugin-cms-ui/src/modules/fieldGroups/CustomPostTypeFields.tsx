import GenerateField from '@erxes/ui-forms/src/settings/properties/components/GenerateField';
import { SidebarContent } from '@erxes/ui-forms/src/settings/properties/styles';
import Button from '@erxes/ui/src/components/Button';
import React from 'react';

type Props = {
  clientPortalId: string;
  customFieldsData: any;
  group: any;
  onChange: (field: string, value: any) => void;
};

const CustomPostTypeFields = (props: Props) => {
  const [hasChanges, setHasChanges] = React.useState(false);
  const { customFieldsData, group } = props;
  const [initialData, setInitialData] = React.useState(customFieldsData);

  React.useEffect(() => {
    setInitialData(customFieldsData);
  }, [customFieldsData]);

  const onChangeValue = ({ _id, value }: { _id: string; value: any }) => {
    const fieldIndex = customFieldsData.findIndex((c: any) => c.field === _id);
    let updatedFields;
  
    if (fieldIndex !== -1) {
      // Create a new array with the updated field
      updatedFields = customFieldsData.map((field, index) => 
        index === fieldIndex ? { ...field, value } : field
      );
    } else {
      // Add new field
      updatedFields = [
        ...customFieldsData,
        { field: _id, value }
      ];
    }
  
    props.onChange('customFieldsData', updatedFields);
    setHasChanges(true);
  };
  const handleCancel = () => {
    props.onChange('customFieldsData', initialData);
    setHasChanges(false);
  };

  return (
    <SidebarContent>
      {group.fields.map((field: any, index) => (
        <GenerateField
          field={field}
          key={index}
          onValueChange={onChangeValue}
          defaultValue={
            customFieldsData.find((c) => c.field === field._id)?.value
          }
        />
      ))}

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
          <Button btnStyle='simple' onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      )}
    </SidebarContent>
  );
};

export default CustomPostTypeFields;

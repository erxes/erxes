import GenerateField from '@erxes/ui-settings/src/properties/components/GenerateField';
import { IField } from '@erxes/ui/src/types';
import React from 'react';
import { HeaderContent, HeaderRow } from '../../styles/item';

type Props = {
  fields: IField[];
  customFieldsData: any;
  onChangeField: (name: any, value: any) => void;
};

class GenerateAddFormFields extends React.Component<Props> {
  render() {
    const customFields = this.props.fields.filter(f => !f.isDefinedByErxes);

    const { customFieldsData } = this.props;

    const onValueChange = ({ _id, value }) => {
      const found = customFieldsData.find(c => c.field === _id);

      if (found) {
        found.value = value;

        this.props.onChangeField('customFieldsData', customFieldsData);
      } else {
        this.props.onChangeField('customFieldsData', [
          ...customFieldsData,
          { field: _id, value }
        ]);
      }
    };

    return customFields.map((field, index) => {
      return (
        <HeaderRow>
          <HeaderContent>
            <GenerateField
              field={field}
              key={index}
              onValueChange={onValueChange}
              isEditing={true}
            />
          </HeaderContent>
        </HeaderRow>
      );
    });
  }
}

export default GenerateAddFormFields;

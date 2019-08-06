import GenerateField from 'modules/settings/properties/components/GenerateField';
import React from 'react';

type Props = {
  formId: string;
  fields: any;
  formFields?: any;
  onChangeFormFields: (data: any) => void;
};

// tslint:disable
class FormFields extends React.Component<Props> {
  render() {
    const { fields, formFields, onChangeFormFields } = this.props;

    const formFieldsMap = {};
    formFields.forEach(field => (formFieldsMap[field._id] = field.value));

    const onValueChange = data => {
      console.log('data: ', data);
    };

    return fields.map(field => (
      <GenerateField
        defaultValue={formFieldsMap[field._id]}
        key={field._id}
        field={field}
        onValueChange={onValueChange}
      />
    ));
  }
}

export default FormFields;

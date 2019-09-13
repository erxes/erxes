import GenerateField from 'modules/settings/properties/components/GenerateField';
import React from 'react';

type Props = {
  formId: string;
  fields: any;
  formSubmissions?: any;
  onChangeFormField: (field: any) => void;
};

class FormFields extends React.Component<Props> {
  render() {
    const { fields, formSubmissions, onChangeFormField } = this.props;

    return fields.map(field => (
      <GenerateField
        defaultValue={formSubmissions[field._id]}
        key={field._id}
        field={field}
        onValueChange={onChangeFormField}
      />
    ));
  }
}

export default FormFields;

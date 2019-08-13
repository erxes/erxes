import GenerateField from 'modules/settings/properties/components/GenerateField';
import React from 'react';

type Props = {
  formId: string;
  fields: any;
  formFields?: any;
  onChangeFormField: (field: any) => void;
};

// tslint:disable
class FormFields extends React.Component<Props> {
  render() {
    const { fields, formFields, onChangeFormField } = this.props;

    return fields.map(field => (
      <GenerateField
        defaultValue={formFields[field._id]}
        key={field._id}
        field={field}
        onValueChange={onChangeFormField}
      />
    ));
  }
}

export default FormFields;

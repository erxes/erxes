import FormFieldPreview from 'modules/forms/components/FormFieldPreview';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import CommonPreview from './CommonPreview';

type Props = {
  formTitle?: string;
  formDesc?: string;
  formBtnText?: string;
  color: string;
  theme: string;
  fields?: IField[];
  onFieldEdit?: (field: IField, props) => void;
  onChange?: (name: any, fields: string) => void;
  onFieldChange?: (name: string, value: IField[]) => void;
  type: string;
};

class FormPreview extends React.Component<Props, {}> {
  render() {
    const {
      formTitle,
      formDesc,
      formBtnText,
      color,
      theme,
      fields,
      onFieldEdit,
      onFieldChange,
      onChange,
      type
    } = this.props;

    return (
      <CommonPreview
        title={formTitle}
        theme={theme}
        color={color}
        btnText={formBtnText}
        btnStyle="primary"
        type={type}
      >
        <FormFieldPreview
          desc={formDesc}
          fields={fields}
          onFieldEdit={onFieldEdit}
          onFieldChange={onFieldChange}
          onChange={onChange}
        />
      </CommonPreview>
    );
  }
}

export default FormPreview;

import { IField } from 'modules/settings/properties/types';
import React from 'react';
import CommonPreview from './CommonPreview';
import FormFieldPreview from './FormFieldPreview';

type Props = {
  formTitle?: string;
  formDesc?: string;
  formBtnText?: string;
  color: string;
  theme: string;
  fields?: IField[];
  onFieldEdit?: (field: IField) => void;
  onChange: (name: any, fields: string) => void;
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
          formDesc={formDesc}
          fields={fields}
          onFieldEdit={onFieldEdit}
          onChange={onChange}
        />
      </CommonPreview>
    );
  }
}

export default FormPreview;

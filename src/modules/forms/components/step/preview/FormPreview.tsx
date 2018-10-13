import { IField } from 'modules/settings/properties/types';
import * as React from 'react';
import { FormFieldPreview } from './';
import CommonPreview from './CommonPreview';

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
        bodyValue={formDesc}
        type={type}
      >
        <FormFieldPreview
          fields={fields}
          onFieldEdit={onFieldEdit}
          onChange={onChange}
        />
      </CommonPreview>
    );
  }
}

export default FormPreview;

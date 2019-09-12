import FormFieldPreview from 'modules/forms/components/FormFieldPreview';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import CommonPreview from './CommonPreview';

type Props = {
  title?: string;
  desc?: string;
  btnText?: string;
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
      title,
      desc,
      btnText,
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
        title={title}
        theme={theme}
        color={color}
        btnText={btnText}
        btnStyle="primary"
        type={type}
      >
        <FormFieldPreview
          desc={desc}
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

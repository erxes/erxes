import FormFieldPreview from 'modules/forms/containers/FormFieldPreview';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import CommonPreview from './CommonPreview';

type Props = {
  formId?: string;
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
      color,
      theme,
      onFieldEdit,
      onFieldChange,
      onChange,
      type,
      formId
    } = this.props;

    if (!formId) {
      return null;
    }

    const wrapper = ({ form, content }) => (
      <CommonPreview
        title={form.title}
        theme={theme}
        color={color}
        btnText={form.btnText}
        btnStyle="primary"
        type={type}
      >
        {content}
      </CommonPreview>
    );

    return (
      <FormFieldPreview
        formId={formId}
        wrapper={wrapper}
        onFieldEdit={onFieldEdit}
        onFieldChange={onFieldChange}
        onChange={onChange}
      />
    );
  }
}

export default FormPreview;

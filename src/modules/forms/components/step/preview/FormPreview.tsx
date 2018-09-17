import React, { Component } from "react";
import { FormFieldPreview } from "./";
import CommonPreview from "./CommonPreview";

type Props = {
  formTitle?: string;
  formDesc?: string;
  formBtnText?: string;
  color?: string;
  theme?: string;
  fields?: any;
  onFieldEdit?: (field) => void;
  onChange?: (name, value) => void;
  type?: string;
};

class FormPreview extends Component<Props, {}> {
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

import React, { Component } from "react";
import { IFormField } from "../../../types";
import { FormFieldPreview } from "./";
import CommonPreview from "./CommonPreview";

type Props = {
  formTitle?: string;
  formDesc?: string;
  formBtnText?: string;
  color?: string;
  theme?: string;
  fields?: IFormField[];
  onFieldEdit?: (field: IFormField) => void;
  onChange?: (name: string, fields: IFormField[] | string) => void;
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

import { IFormData } from 'modules/forms/types';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import CommonPreview from './CommonPreview';

type Props = {
  previewRenderer: () => React.ReactNode;
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
  currentPage: number;
  formData: IFormData;
  onPageChange?: (page: number) => void;
};

class FormPreview extends React.Component<Props, {}> {
  render() {
    const {
      title,
      btnText,
      color,
      theme,
      type,
      previewRenderer,
      currentPage,
      formData,
      onPageChange
    } = this.props;

    if (!previewRenderer) {
      return null;
    }

    return (
      <CommonPreview
        title={title}
        theme={theme}
        color={color}
        btnText={btnText}
        btnStyle="primary"
        type={type}
        currentPage={currentPage}
        numberOfPages={formData.numberOfPages || 1}
        onPageChange={onPageChange}
      >
        {previewRenderer()}
      </CommonPreview>
    );
  }
}

export default FormPreview;

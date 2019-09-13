import { Preview } from 'modules/common/components/step/styles';
import CreateForm from 'modules/forms/containers/CreateForm';
import EditForm from 'modules/forms/containers/EditForm';
import { IFormData } from 'modules/forms/types';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import { FormPreview } from './preview';
import { FlexItem } from './style';

type Props = {
  type: string;
  color: string;
  theme: string;
  isReadyToSaveForm: boolean;
  formData: IFormData;
  formId?: string;
  afterDbSave: (formId: string) => void;
  onDocChange?: (doc: IFormData) => void;
  onInit?: (fields: IField[]) => void;
};

class FormStep extends React.Component<Props> {
  renderFormPreviewWrapper = previewRenderer => {
    const { color, theme, type, formData } = this.props;

    return (
      <Preview>
        <FormPreview
          type={type}
          color={color}
          theme={theme}
          title={formData.title}
          desc={formData.desc}
          btnText={formData.btnText}
          previewRenderer={previewRenderer}
        />
      </Preview>
    );
  };

  renderContent() {
    const {
      formId,
      onDocChange,
      afterDbSave,
      onInit,
      isReadyToSaveForm
    } = this.props;

    const doc = {
      renderPreviewWrapper: this.renderFormPreviewWrapper,
      afterDbSave,
      onDocChange,
      isReadyToSave: isReadyToSaveForm,
      onInit,
      type: 'lead'
    };

    if (formId) {
      return <EditForm {...doc} formId={formId} />;
    }

    return <CreateForm {...doc} />;
  }

  render() {
    return <FlexItem>{this.renderContent()}</FlexItem>;
  }
}

export default FormStep;

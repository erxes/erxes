import { Preview } from 'modules/common/components/step/styles';
import CreateForm from 'modules/forms/containers/CreateForm';
import EditForm from 'modules/forms/containers/EditForm';
import { IFormData, IFormPreviewContent } from 'modules/forms/types';
import { FieldsQueryResponse } from 'modules/settings/properties/types';
import React from 'react';
import FormPreview from './preview/FormPreview';
import { FlexItem } from './style';

type Props = {
  type: string;
  color: string;
  theme: string;
  isSaving: boolean;
  formId?: string;
  onChange: (callback: string | FieldsQueryResponse) => void;
  onDocChange?: (doc: IFormData) => void;
};

class FormStep extends React.Component<Props> {
  renderFormPreview = (props: IFormPreviewContent) => {
    return (
      <Preview>
        <FormPreview {...this.props} {...props} />
      </Preview>
    );
  };

  renderContent() {
    const { formId, onDocChange, onChange, isSaving } = this.props;

    const doc = {
      renderPreview: this.renderFormPreview,
      onChange,
      onDocChange,
      isSaving,
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

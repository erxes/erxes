import { Preview } from 'modules/common/components/step/styles';
import CreateForm from 'modules/forms/containers/CreateForm';
import EditForm from 'modules/forms/containers/EditForm';
import { IFormPreviewContent } from 'modules/forms/types';
import React from 'react';
import FormPreview from './preview/FormPreview';
import { FlexItem } from './style';

type Props = {
  type: string;
  color: string;
  theme: string;
  isSaving: boolean;
  formId?: string;
  onChange: (doc: any) => void;
};

class FormStep extends React.Component<Props> {
  renderContent() {
    const { formId } = this.props;

    const content = (props: IFormPreviewContent) => {
      return (
        <Preview>
          <FormPreview {...this.props} {...props} />
        </Preview>
      );
    };

    const doc = {
      previewContent: content,
      onChange: this.props.onChange,
      isSaving: this.props.isSaving
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

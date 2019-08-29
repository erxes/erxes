import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Tip from 'modules/common/components/Tip';
import FormFieldPreview from 'modules/forms/components/FormFieldPreview';
import CreateForm from 'modules/forms/containers/CreateForm';
import EditForm from 'modules/forms/containers/EditForm';
import { IFormPreviewContent } from 'modules/forms/types';
import React from 'react';

type Props = {
  formId: string;
};

class FormBuilder extends React.Component<Props, {}> {
  renderFormPreview = (props: IFormPreviewContent) => {
    return <FormFieldPreview {...props} />;
  };

  renderContent = () => {
    const { formId } = this.props;

    const doc = {
      renderPreview: this.renderFormPreview,
      onChange: () => null,
      onDocChange: () => null,
      isSaving: false
    };

    if (formId) {
      return <EditForm {...doc} formId={formId} />;
    }

    return <CreateForm {...doc} />;
  };

  render() {
    const formTrigger = (
      <Button btnStyle="link">
        <Tip text="Edit">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return (
      <ModalTrigger
        size="lg"
        title="Edit"
        trigger={formTrigger}
        dialogClassName="transform"
        content={this.renderContent}
      />
    );
  }
}

export default FormBuilder;

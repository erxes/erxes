import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Tip from 'modules/common/components/Tip';
import FormFieldPreview from 'modules/forms/components/FormFieldPreview';
import CreateForm from 'modules/forms/containers/CreateForm';
import EditForm from 'modules/forms/containers/EditForm';
import { IFormPreviewContent } from 'modules/forms/types';
import React from 'react';
import { Modal } from 'react-bootstrap';
import { PreviewWrapper } from '../styles';

type Props = {
  formId: string;
  onChangeForm: (stageId: string, formId: string) => void;
  stageId: string;
};

class FormBuilder extends React.Component<Props, { isSaveForm: boolean }> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isSaveForm: false
    };
  }

  renderFormPreview = (props: IFormPreviewContent) => {
    return (
      <PreviewWrapper>
        <FormFieldPreview {...props} />
      </PreviewWrapper>
    );
  };

  saveForm = () => {
    this.setState({ isSaveForm: true });
  };

  onAfterSaveForm = formId => {
    this.props.onChangeForm(this.props.stageId, formId);
  };

  renderFormContent = () => {
    const { formId } = this.props;

    const doc = {
      renderPreview: this.renderFormPreview,
      onChange: this.onAfterSaveForm,
      isSaving: this.state.isSaveForm,
      type: 'growthHack'
    };

    if (formId) {
      return <EditForm {...doc} formId={formId} />;
    }

    return <CreateForm {...doc} />;
  };

  renderContent = modalProps => {
    return (
      <>
        {this.renderFormContent()}
        <Modal.Footer>
          <Button
            btnStyle="simple"
            type="button"
            icon="cancel-1"
            onClick={modalProps.closeModal}
          >
            Cancel
          </Button>

          <Button
            btnStyle="success"
            type="button"
            icon="cancel-1"
            onClick={this.saveForm}
          >
            Save
          </Button>
        </Modal.Footer>
      </>
    );
  };

  render() {
    const formTrigger = (
      <Button btnStyle="link">
        <Tip text="Edit">
          <Icon icon={this.props.formId ? 'file-edit-alt' : 'file-plus-alt'} />
        </Tip>
      </Button>
    );

    return (
      <ModalTrigger
        size="lg"
        title="Edit"
        trigger={formTrigger}
        dialogClassName="transform modal-1000w"
        content={this.renderContent}
        hideHeader={true}
      />
    );
  }
}

export default FormBuilder;

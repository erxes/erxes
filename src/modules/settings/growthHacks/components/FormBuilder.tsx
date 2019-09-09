import { IStage } from 'modules/boards/types';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import { CloseModal } from 'modules/common/styles/main';
import FormFieldPreview from 'modules/forms/components/FormFieldPreview';
import CreateForm from 'modules/forms/containers/CreateForm';
import EditForm from 'modules/forms/containers/EditForm';
import { IFormPreviewContent } from 'modules/forms/types';
import React from 'react';
import { Modal } from 'react-bootstrap';
import { ContentWrapper, PreviewWrapper } from '../styles';

type Props = {
  onChange: (stageId: string, name: string, value: string) => void;
  onHide: () => void;
  stage: IStage;
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

        <Modal.Footer>
          <Button
            btnStyle="simple"
            type="button"
            icon="cancel-1"
            onClick={this.closeModal}
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
      </PreviewWrapper>
    );
  };

  saveForm = () => {
    this.setState({ isSaveForm: true });
  };

  onAfterSaveForm = (formId: string) => {
    const { stage, onChange, onHide } = this.props;

    onChange(stage._id, 'formId', formId);
    onHide();

    this.setState({ isSaveForm: false });
  };

  closeModal = () => {
    this.props.onHide();
  };

  renderFormContent = () => {
    const { stage } = this.props;

    const props = {
      renderPreview: this.renderFormPreview,
      onChange: this.onAfterSaveForm,
      isSaving: this.state.isSaveForm,
      hideOptionalFields: true,
      type: 'growthHack'
    };

    if (stage.formId) {
      return <EditForm {...props} formId={stage.formId} />;
    }

    return <CreateForm {...props} />;
  };

  renderContent = () => {
    return <ContentWrapper>{this.renderFormContent()}</ContentWrapper>;
  };

  render() {
    return (
      <>
        <Modal
          dialogClassName="modal-1000w"
          enforceFocus={false}
          bsSize="lg"
          show={true}
          onHide={this.closeModal}
          backdrop={false}
        >
          <CloseModal onClick={this.closeModal}>
            <Icon icon="times" />
          </CloseModal>
          {this.renderContent()}
        </Modal>
      </>
    );
  }
}

export default FormBuilder;

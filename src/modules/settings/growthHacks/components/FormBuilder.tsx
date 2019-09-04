import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { colors } from 'modules/common/styles';
import { CloseModal } from 'modules/common/styles/main';
import FormFieldPreview from 'modules/forms/components/FormFieldPreview';
import CreateForm from 'modules/forms/containers/CreateForm';
import EditForm from 'modules/forms/containers/EditForm';
import { IFormPreviewContent } from 'modules/forms/types';
import React from 'react';
import { Modal } from 'react-bootstrap';
import { ContentWrapper, PreviewWrapper } from '../styles';

type Props = {
  formId: string;
  onChangeForm: (stageId: string, formId: string) => void;
  stageId: string;
};

class FormBuilder extends React.Component<
  Props,
  { isSaveForm: boolean; isOpenModal: boolean }
> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isSaveForm: false,
      isOpenModal: false
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

  onAfterSaveForm = formId => {
    this.props.onChangeForm(this.props.stageId, formId);
    this.setState({ isOpenModal: false });
  };

  closeModal = () => {
    this.setState({ isOpenModal: false });
  };

  openModal = () => {
    this.setState({ isOpenModal: true });
  };

  renderFormContent = () => {
    const { formId } = this.props;

    const doc = {
      renderPreview: this.renderFormPreview,
      onChange: this.onAfterSaveForm,
      isSaving: this.state.isSaveForm,
      hideOptionalFields: true,
      type: 'growthHack'
    };

    if (this.props.formId) {
      return <EditForm {...doc} formId={formId} />;
    }

    return <CreateForm {...doc} />;
  };

  renderContent = () => {
    return <ContentWrapper>{this.renderFormContent()}</ContentWrapper>;
  };

  render() {
    const formId = this.props.formId;

    return (
      <>
        <Button btnStyle="link" onClick={this.openModal}>
          <Tip text="Edit">
            <Icon
              icon={formId ? 'file-edit-alt' : 'file-plus-alt'}
              color={formId ? colors.colorSecondary : colors.colorCoreGreen}
            />
          </Tip>
        </Button>
        <Modal
          dialogClassName="modal-1000w"
          enforceFocus={false}
          bsSize="lg"
          show={this.state.isOpenModal}
          onHide={this.closeModal}
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

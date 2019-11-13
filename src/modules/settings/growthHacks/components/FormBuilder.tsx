import { IStage } from 'modules/boards/types';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import { CloseModal, ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import CreateForm from 'modules/forms/containers/CreateForm';
import EditForm from 'modules/forms/containers/EditForm';
import { ShowPreview } from 'modules/forms/styles';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import { ContentWrapper, PreviewWrapper } from '../styles';

type Props = {
  onChange: (stageId: string, name: string, value: string) => void;
  onHide: () => void;
  stage: IStage;
};

class FormBuilder extends React.Component<
  Props,
  { isReadyToSaveForm: boolean }
> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isReadyToSaveForm: false
    };
  }

  renderFooter = (items: number) => {
    if (items === 0) {
      return null;
    }

    return (
      <>
        <ShowPreview>
          <Icon icon="eye" /> {__('Form preview')}
        </ShowPreview>
        <ModalFooter>
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
        </ModalFooter>
      </>
    );
  };

  renderFormPreviewWrapper = (previewRenderer, fields: IField[]) => {
    return (
      <PreviewWrapper>
        {previewRenderer()}
        {this.renderFooter(fields ? fields.length : 0)}
      </PreviewWrapper>
    );
  };

  saveForm = () => {
    this.setState({ isReadyToSaveForm: true });
  };

  afterFormDbSave = (formId: string) => {
    const { stage, onChange, onHide } = this.props;

    onChange(stage._id, 'formId', formId);
    onHide();

    this.setState({ isReadyToSaveForm: false });
  };

  closeModal = () => {
    this.props.onHide();
  };

  renderFormContent = () => {
    const { stage } = this.props;

    const props = {
      renderPreviewWrapper: this.renderFormPreviewWrapper,
      afterDbSave: this.afterFormDbSave,
      isReadyToSave: this.state.isReadyToSaveForm,
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
    );
  }
}

export default FormBuilder;

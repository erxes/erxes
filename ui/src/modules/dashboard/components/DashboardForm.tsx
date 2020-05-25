import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import React from 'react';
import { Modal } from 'react-bootstrap';
import { IDashboard } from '../types';

type Props = {
  dashboard?: IDashboard;
  show: boolean;
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

class DashbaordForm extends React.Component<Props, {}> {
  generateDoc = (values: { _id?: string; name: string }) => {
    const { dashboard } = this.props;
    const finalValues = values;

    if (dashboard) {
      finalValues._id = dashboard._id;
    }

    return {
      _id: finalValues._id,
      name: finalValues.name
    };
  };

  renderContent = (formProps: IFormProps) => {
    const { dashboard, renderButton, closeModal } = this.props;
    const { values, isSubmitted } = formProps;
    const object = dashboard || { name: '' };

    return (
      <>
        <Modal.Header closeButton={true}>
          <Modal.Title>
            {dashboard ? `Edit dashboard` : `Add dashboard`}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <FormGroup>
            <ControlLabel required={true}>Name</ControlLabel>

            <FormControl
              {...formProps}
              name="name"
              defaultValue={object.name}
              required={true}
              autoFocus={true}
            />
          </FormGroup>

          <ModalFooter>
            <Button
              btnStyle="simple"
              type="button"
              icon="times-circle"
              uppercase={false}
              onClick={closeModal}
            >
              Cancel
            </Button>

            {renderButton({
              name: 'dashboard',
              values: this.generateDoc(values),
              isSubmitted,
              callback: closeModal,
              object: dashboard
            })}
          </ModalFooter>
        </Modal.Body>
      </>
    );
  };

  render() {
    const { show, closeModal } = this.props;

    if (!show) {
      return null;
    }

    return (
      <Modal
        show={show}
        onHide={closeModal}
        enforceFocus={false}
        animation={false}
      >
        <Form renderContent={this.renderContent} />
      </Modal>
    );
  }
}

export default DashbaordForm;

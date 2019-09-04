import { IBoard } from 'modules/boards/types';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import React from 'react';
import { Modal } from 'react-bootstrap';

type Props = {
  board: IBoard;
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  type: string;
};

class BoardForm extends React.Component<Props, {}> {
  generateDoc = (values: { _id?: string; name: string }) => {
    const { board, type } = this.props;
    const finalValues = values;

    if (board) {
      finalValues._id = board._id;
    }

    return {
      ...finalValues,
      type
    };
  };

  renderContent = (formProps: IFormProps) => {
    const { board, renderButton, closeModal } = this.props;
    const { values, isSubmitted } = formProps;
    const object = board || { name: '' };

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>

          <FormControl
            {...formProps}
            name="name"
            defaultValue={object.name}
            required={true}
          />
        </FormGroup>

        <Modal.Footer>
          <Button
            btnStyle="simple"
            type="button"
            icon="cancel-1"
            onClick={closeModal}
          >
            Cancel
          </Button>

          {renderButton({
            name: 'board',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: board
          })}
        </Modal.Footer>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default BoardForm;

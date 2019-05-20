import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { IBoard } from '../types';

type Props = {
  board: IBoard;
  closeModal: () => void;
  save: (
    params: { doc: { name: string } },
    callback: () => void,
    brand: IBoard
  ) => void;
  type: string;
};

class BoardForm extends React.Component<Props, {}> {
  save = e => {
    e.preventDefault();

    this.props.save(
      this.generateDoc(),
      () => this.props.closeModal(),
      this.props.board
    );
  };

  generateDoc = () => {
    return {
      doc: {
        name: (document.getElementById('channel-name') as HTMLInputElement)
          .value,
        type: this.props.type
      }
    };
  };

  renderContent() {
    const { board } = this.props;

    const object = board || { name: '' };

    return (
      <div>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>

          <FormControl
            id="channel-name"
            defaultValue={object.name}
            type="text"
            required={true}
          />
        </FormGroup>
      </div>
    );
  }

  render() {
    return (
      <form onSubmit={this.save}>
        {this.renderContent()}

        <Modal.Footer>
          <Button
            btnStyle="simple"
            type="button"
            icon="cancel-1"
            onClick={this.props.closeModal}
          >
            Cancel
          </Button>

          <Button btnStyle="success" icon="checked-1" type="submit">
            Save
          </Button>
        </Modal.Footer>
      </form>
    );
  }
}

export default BoardForm;

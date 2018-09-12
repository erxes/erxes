import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import PropTypes from 'prop-types';
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { IBoard } from '../types';

type Props = {
  board: IBoard,
  save: (params: { doc: { name: string; }}, callback: () => void, brand: IBoard) => void,
};

class BoardForm extends React.Component<Props, {}> {
  static contextTypes =  {
    closeModal: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);

    this.generateDoc = this.generateDoc.bind(this);
    this.save = this.save.bind(this);
  }

  save(e) {
    e.preventDefault();

    this.props.save(
      this.generateDoc(),
      () => this.context.closeModal(),
      this.props.board
    );
  }

  generateDoc() {
    return {
      doc: {
        name: (document.getElementById('channel-name') as HTMLInputElement).value
      }
    };
  }

  renderContent() {
    const { board } = this.props;

    const object = board;

    return (
      <div>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl
            id="channel-name"
            defaultValue={object.name}
            type="text"
            required
          />
        </FormGroup>
      </div>
    );
  }

  render() {
    const onClick = () => {
      this.context.closeModal();
    };

    return (
      <form onSubmit={this.save}>
        {this.renderContent()}

        <Modal.Footer>
          <Button
            btnStyle="simple"
            type="button"
            icon="cancel-1"
            onClick={onClick}
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

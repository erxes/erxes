import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import {
  Button,
  FormGroup,
  FormControl,
  ControlLabel
} from 'modules/common/components';

const propTypes = {
  addPipeline: PropTypes.func.isRequired
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class PipelineForm extends React.Component {
  constructor(props) {
    super(props);

    this.addPipeline = this.addPipeline.bind(this);
  }

  addPipeline(e) {
    e.preventDefault();
    const name = document.getElementById('pipeline-name');

    this.props.addPipeline({
      doc: {
        name: name.value,
        boardId: '1234'
      },

      callback: () => {
        name.value = '';
        if (document.activeElement.name === 'close') this.context.closeModal();
      }
    });
  }

  render() {
    return (
      <form onSubmit={e => this.addPipeline(e)}>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl id="pipeline-name" type="text" autoFocus required />
        </FormGroup>

        <Modal.Footer>
          <Button
            btnStyle="simple"
            onClick={() => {
              this.context.closeModal();
            }}
            icon="close"
          >
            Close
          </Button>

          <Button btnStyle="success" type="submit" icon="checkmark">
            Save & New
          </Button>

          <Button btnStyle="primary" type="submit" name="close" icon="close">
            Save & Close
          </Button>
        </Modal.Footer>
      </form>
    );
  }
}

PipelineForm.propTypes = propTypes;
PipelineForm.contextTypes = contextTypes;

export default PipelineForm;

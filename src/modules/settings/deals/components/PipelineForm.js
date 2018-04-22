import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import {
  FormGroup,
  FormControl,
  ControlLabel,
  Button
} from 'modules/common/components';
import { Stages } from './';

const propTypes = {
  boardId: PropTypes.string,
  pipeline: PropTypes.object,
  stages: PropTypes.array,
  save: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class PipelineForm extends Component {
  constructor(props) {
    super(props);

    this.save = this.save.bind(this);
    this.onChangeStages = this.onChangeStages.bind(this);
    this.generateDoc = this.generateDoc.bind(this);

    this.state = { stages: (props.stages || []).map(stage => ({ ...stage })) };
  }

  onChangeStages(stages) {
    this.setState({ stages });
  }

  save(e) {
    e.preventDefault();

    const { save, pipeline } = this.props;

    save(this.generateDoc(), () => this.context.closeModal(), pipeline);
  }

  generateDoc() {
    const { pipeline } = this.props;

    return {
      doc: {
        name: document.getElementById('pipeline-name').value,
        boardId: pipeline ? pipeline.boardId : this.props.boardId,
        stages: this.state.stages.filter(el => el.name)
      }
    };
  }

  renderContent() {
    const { pipeline = {} } = this.props;
    const { stages } = this.state;

    return (
      <div>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl
            id="pipeline-name"
            defaultValue={pipeline.name}
            type="text"
            required
          />
        </FormGroup>

        <Stages stages={stages} onChangeStages={this.onChangeStages} />
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
            onClick={() => this.context.closeModal()}
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

PipelineForm.propTypes = propTypes;
PipelineForm.contextTypes = contextTypes;

export default PipelineForm;

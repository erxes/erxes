import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import {
  FormGroup,
  FormControl,
  ControlLabel,
  Button
} from 'modules/common/components';
import { listObjectUnFreeze } from 'modules/common/utils';
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

    this.generateDoc = this.generateDoc.bind(this);
    this.save = this.save.bind(this);
    this.onChangeStages = this.onChangeStages.bind(this);
    this.renderContent = this.renderContent.bind(this);

    this.state = {
      stages: listObjectUnFreeze(props.stages)
    };
  }

  onChangeStages(stages) {
    this.setState({
      stages
    });
  }

  save(e) {
    e.preventDefault();

    this.props.save(
      this.generateDoc(),
      () => {
        this.context.closeModal();
      },
      this.props.pipeline
    );
  }

  generateDoc() {
    const { pipeline } = this.props;

    return {
      doc: {
        name: document.getElementById('pipeline-name').value,
        boardId: pipeline ? pipeline.boardId : this.props.boardId,
        stages: this.state.stages.filter(el => el.name !== '')
      }
    };
  }

  renderContent() {
    const { pipeline } = this.props;

    const object = pipeline || {};

    return (
      <div>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl
            id="pipeline-name"
            defaultValue={object.name}
            type="text"
            required
          />
        </FormGroup>
        {pipeline ? (
          <Stages
            stages={this.state.stages}
            onChangeStages={this.onChangeStages}
            boardId={pipeline.boardId}
            pipelineId={pipeline._id}
          />
        ) : null}
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
            icon="close"
            onClick={onClick}
          >
            Cancel
          </Button>

          <Button btnStyle="success" icon="checkmark" type="submit">
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

import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import Select from 'react-select-plus';
import { Button, FormGroup } from 'modules/common/components';
import { selectOptions } from '../../utils';

class DealMoveForm extends React.Component {
  constructor(props) {
    super(props);

    this.move = this.move.bind(this);

    this.state = {
      stageId: props.stageId
    };
  }

  move() {
    const { deal, boardId, pipelineId } = this.props;

    const doc = {
      _id: deal._id,
      boardId,
      pipelineId,
      stageId: this.state.stageId
    };

    this.props.move(doc, () => {
      this.props.refetch();
      this.props.closeEditForm();
    });
  }

  onChangeStage(stage) {
    if (stage) {
      this.setState({
        stageId: stage.value
      });
    }
  }

  render() {
    const { boards, pipelines, stages, boardId, pipelineId } = this.props;

    return (
      <form>
        <FormGroup>
          <Select
            placeholder="Choose a board"
            value={boardId}
            onChange={board => this.props.onChangeBoard(board.value)}
            optionRenderer={option => (
              <div className="simple-option">
                <span>{option.label}</span>
              </div>
            )}
            options={selectOptions(boards)}
            clearable={false}
          />
        </FormGroup>
        <FormGroup>
          <Select
            placeholder="Choose a pipeline"
            value={pipelineId}
            onChange={pipeline => this.props.onChangePipeline(pipeline.value)}
            optionRenderer={option => (
              <div className="simple-option">
                <span>{option.label}</span>
              </div>
            )}
            options={selectOptions(pipelines)}
            clearable={false}
          />
        </FormGroup>
        <FormGroup>
          <Select
            placeholder="Choose a stage"
            value={this.state.stageId}
            onChange={value => this.onChangeStage(value)}
            optionRenderer={option => {
              return (
                <div className="simple-option">
                  <span>{option.label}</span>
                </div>
              );
            }}
            options={selectOptions(stages)}
            clearable={false}
          />
        </FormGroup>
        <Modal.Footer>
          <Button btnStyle="simple" onClick={this.props.close} icon="close">
            Close
          </Button>

          <Button btnStyle="success" onClick={this.move} icon="checkmark">
            Move
          </Button>
        </Modal.Footer>
      </form>
    );
  }
}

const propTypes = {
  deal: PropTypes.object.isRequired,
  boards: PropTypes.array.isRequired,
  pipelines: PropTypes.array.isRequired,
  stages: PropTypes.array.isRequired,
  boardId: PropTypes.string.isRequired,
  stageId: PropTypes.string.isRequired,
  pipelineId: PropTypes.string.isRequired,
  close: PropTypes.func.isRequired,
  closeEditForm: PropTypes.func.isRequired,
  onChangeBoard: PropTypes.func.isRequired,
  onChangePipeline: PropTypes.func.isRequired,
  move: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired
};

DealMoveForm.propTypes = propTypes;

export default DealMoveForm;

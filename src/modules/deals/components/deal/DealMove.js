import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select-plus';
import { FormGroup, ControlLabel, Tip, Icon } from 'modules/common/components';
import { selectOptions } from '../../utils';
import {
  MoveContainer,
  MoveFormContainer,
  PipelineName,
  Stages,
  StageItem
} from '../../styles/deal';

class DealMoveForm extends React.Component {
  renderSelect(placeholder, value, onChange, options) {
    return (
      <Select
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        optionRenderer={option => (
          <div className="simple-option">
            <span>{option.label}</span>
          </div>
        )}
        options={options}
        clearable={false}
      />
    );
  }

  renderForm() {
    if (!this.props.show) return null;

    const { __ } = this.context;
    const {
      boards,
      pipelines,
      stages,
      boardId,
      pipelineId,
      stageId,
      onChangeBoard,
      onChangePipeline,
      onChangeStage
    } = this.props;

    return (
      <form>
        <FormGroup>
          <ControlLabel>Board</ControlLabel>
          {this.renderSelect(
            __('Choose a board'),
            boardId,
            board => onChangeBoard(board.value),
            selectOptions(boards)
          )}
        </FormGroup>

        <FormGroup>
          <ControlLabel>Pipeline</ControlLabel>
          {this.renderSelect(
            __('Choose a pipeline'),
            pipelineId,
            pipeline => onChangePipeline(pipeline.value),
            selectOptions(pipelines)
          )}
        </FormGroup>

        <FormGroup>
          <ControlLabel>Stage</ControlLabel>
          {this.renderSelect(
            __('Choose a stage'),
            stageId,
            stage => onChangeStage(stage.value, true),
            selectOptions(stages)
          )}
        </FormGroup>
      </form>
    );
  }

  renderStages() {
    const { stages, stageId, onChangeStage } = this.props;

    let isPass = true;

    return (
      <Stages>
        {stages.map(s => {
          const item = (
            <StageItem key={s._id} isPass={isPass}>
              <Tip text={s.name}>
                <a onClick={() => onChangeStage(s._id)}>
                  <Icon icon="ios-checkmark" />
                </a>
              </Tip>
            </StageItem>
          );

          if (s._id === stageId) isPass = false;

          return item;
        })}
      </Stages>
    );
  }

  render() {
    const { pipelines, pipelineId, toggleForm } = this.props;
    const currentPipeline = pipelines.find(p => p._id === pipelineId) || {};

    return (
      <MoveContainer>
        <MoveFormContainer>
          <PipelineName onClick={toggleForm}>
            {currentPipeline.name} <Icon erxes icon="downarrow" />
          </PipelineName>

          {this.renderForm()}
        </MoveFormContainer>

        {this.renderStages()}
      </MoveContainer>
    );
  }
}

const propTypes = {
  deal: PropTypes.object.isRequired,
  boards: PropTypes.array.isRequired,
  pipelines: PropTypes.array.isRequired,
  stages: PropTypes.array.isRequired,
  boardId: PropTypes.string.isRequired,
  pipelineId: PropTypes.string,
  stageId: PropTypes.string,
  show: PropTypes.bool,
  toggleForm: PropTypes.func.isRequired,
  onChangeBoard: PropTypes.func.isRequired,
  onChangePipeline: PropTypes.func.isRequired,
  onChangeStage: PropTypes.func.isRequired
};

DealMoveForm.propTypes = propTypes;
DealMoveForm.contextTypes = {
  __: PropTypes.func
};

export default DealMoveForm;

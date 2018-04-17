import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select-plus';
import { FormGroup, ControlLabel } from 'modules/common/components';
import { selectOptions } from '../../utils';
import { SelectContainer } from '../../styles/deal';

class DealSelect extends React.Component {
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

  render() {
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
      onChangeStage,
      callback
    } = this.props;

    return (
      <SelectContainer>
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
            stage => onChangeStage(stage.value, callback),
            selectOptions(stages)
          )}
        </FormGroup>
      </SelectContainer>
    );
  }
}

const propTypes = {
  boards: PropTypes.array.isRequired,
  pipelines: PropTypes.array.isRequired,
  stages: PropTypes.array.isRequired,
  boardId: PropTypes.string.isRequired,
  pipelineId: PropTypes.string,
  stageId: PropTypes.string,
  onChangeBoard: PropTypes.func.isRequired,
  onChangePipeline: PropTypes.func.isRequired,
  onChangeStage: PropTypes.func.isRequired,
  callback: PropTypes.func
};

DealSelect.propTypes = propTypes;
DealSelect.contextTypes = {
  __: PropTypes.func
};

export default DealSelect;

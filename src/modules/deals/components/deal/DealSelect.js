import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select-plus';
import { FormGroup, ControlLabel } from 'modules/common/components';
import { selectOptions } from '../../utils';

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
      <Fragment>
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
      </Fragment>
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
  show: PropTypes.bool,
  onChangeBoard: PropTypes.func.isRequired,
  onChangePipeline: PropTypes.func.isRequired,
  onChangeStage: PropTypes.func.isRequired
};

DealSelect.propTypes = propTypes;
DealSelect.contextTypes = {
  __: PropTypes.func
};

export default DealSelect;

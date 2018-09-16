import { ControlLabel, FormGroup } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import Select from 'react-select-plus';
import { SelectContainer } from '../../styles/deal';
import { selectOptions } from '../../utils';

type Props = {
  boards: any,
  pipelines: any,
  stages: any,
  boardId?: string,
  pipelineId?: string,
  stageId?: string,
  onChangeBoard: any,
  onChangePipeline: any,
  onChangeStage: any,
  callback?: any
};

class DealSelect extends React.Component<Props> {
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

export default DealSelect;

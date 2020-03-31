import Button from 'modules/common/components/Button';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { __ } from 'modules/common/utils';
import React from 'react';
import Select from 'react-select-plus';
import styled from 'styled-components';
import { IBoard, IPipeline } from '../../types';
import { selectOptions } from '../../utils';

const SelectPipeline = styled.div`
  min-width: 220px;
  font-weight: initial;
  margin: 15px;
`;

type Props = {
  stageId: string;
  action: string;
  boards: IBoard[];
  pipelines: IPipeline[];
  copyOrMoveStage: (stageId: string, pipelineId: string, initialPipelineId: string) => void;
  pipelineId: string;
};

type State = {
  boardId: string;
  pipelineId: string;
};

class PipelineSelector extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      boardId: props.boardId,
      pipelineId: props.pipelineId
    };
  }

  onSelectChange(option, name) {
    this.setState({ [name]: option } as Pick<State, keyof State>);
  }

  renderOptions = option => {
    return (
      <div className="simple-option">
        <span>{option.label}</span>
      </div>
    );
  };

  renderSelect(placeholder, value, onChange, options) {
    return (
      <Select
        isRequired={true}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        optionRenderer={this.renderOptions}
        options={options}
        clearable={false}
      />
    );
  }

  render() {
    const {
      boards,
      pipelines,
      action,
      copyOrMoveStage,
      stageId
    } = this.props;
    const { boardId, pipelineId } = this.state;

    const filteredPipelines = boardId
      ? pipelines.filter(p => p.boardId === boardId)
      : pipelines;

    const initialPipeline = this.props.pipelineId;

    const onSubmit = () => copyOrMoveStage(stageId, pipelineId, initialPipeline);

    return (
      <SelectPipeline>
        <FormGroup>
          <ControlLabel>{__('Board')}</ControlLabel>
          {this.renderSelect(
            __('Choose a board'),
            boardId,
            board => this.onSelectChange(board.value, 'boardId'),
            selectOptions(boards)
          )}
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Pipeline')}</ControlLabel>
          {this.renderSelect(
            __('Choose a pipeline'),
            pipelineId,
            pipeline => this.onSelectChange(pipeline.value, 'pipelineId'),
            selectOptions(filteredPipelines)
          )}
        </FormGroup>

        <Button
          block={true}
          btnStyle="success"
          icon="check-1"
          onClick={onSubmit}
          size="small"
        >
          {action}
        </Button>
      </SelectPipeline>
    );
  }
}

export default PipelineSelector;

import Button from 'modules/common/components/Button';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import React from 'react';
import Select from 'react-select-plus';
import { IBoard, IPipeline } from '../../types';
import { selectOptions } from '../../utils';

type Props = {
  stageId: string;
  action: string;
  boards: IBoard[];
  pipelines: IPipeline[];
  moveStage: (stageId: string, pipelineId: string) => void;
  copyStage: (stageId: string, pipelineId: string) => void;
};

type State = {
  boardId: string;
  pipelineId: string;
};

class PipelineSelect extends React.Component<Props, State> {
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

  renderContent() {
    const {
      boards,
      pipelines,
      action,
      copyStage,
      moveStage,
      stageId
    } = this.props;
    const { boardId, pipelineId } = this.state;

    const filteredPipelines = boardId
      ? pipelines.filter(p => p.boardId === boardId)
      : pipelines;

    let onSubmit;

    if (action === 'Copy') {
      onSubmit = () => copyStage(stageId, pipelineId);
    }

    if (action === 'Move') {
      onSubmit = () => moveStage(stageId, pipelineId);
    }

    return (
      <>
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
        <ModalFooter>
          <Button btnStyle="simple" icon="cancel-1">
            {__('Cancel')}
          </Button>
          <Button btnStyle="success" icon="checked-1" onClick={onSubmit}>
            {__('Confirm')}
          </Button>
        </ModalFooter>
      </>
    );
  }

  render() {
    return <>{this.renderContent()}</>;
  }
}

export default PipelineSelect;

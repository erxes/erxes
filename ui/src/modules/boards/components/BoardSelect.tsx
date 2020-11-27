import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { __ } from 'modules/common/utils';
import React from 'react';
import Select from 'react-select-plus';
import { FormContainer } from '../styles/common';
import { IBoard, IPipeline ,IStage} from '../types';
import { selectOptions } from '../utils';

type Props = {
  boards: IBoard[];
  pipelines: IPipeline[];
  stages: IStage[];
  cards: any[];
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
  cardId?: string;
  onChangeBoard: (value: string) => void;
  onChangePipeline: (value: string) => void;
  onChangeStage: (value: string, callback?: () => void) => void;
  onChangeCard: (value: string) => void;
  callback?: () => void;
};

class BoardSelect extends React.Component<Props> {
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
      stages,
      cards,
      boardId,
      pipelineId,
      stageId,
      cardId,
      onChangeBoard,
      onChangePipeline,
      onChangeStage,
      onChangeCard,
      callback
    } = this.props;

    return (
      <>
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

        <FormGroup>
          <ControlLabel>Card</ControlLabel>
          {this.renderSelect(
            __('Attach to an existing card'),
            cardId,
            card => onChangeCard(card.value),
            selectOptions(cards)
          )}
        </FormGroup>
      </>
    );
  }

  render() {
    return <FormContainer>{this.renderContent()}</FormContainer>;
  }
}

export default BoardSelect;

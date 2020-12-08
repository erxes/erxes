import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { __ } from 'modules/common/utils';
import React from 'react';
import Select from 'react-select-plus';
import { FormContainer } from '../styles/common';
import { IBoard, IPipeline, IStage } from '../types';
import { selectOptions } from '../utils';
import CardAutoCompletion from './CardAutoCompletion';

type Props = {
  type: string;
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
  onChangeCardName: (value: string) => void;
  callback?: () => void;
};

class BoardSelect extends React.Component<Props> {
  onCardChange = (params: { cardId?: string; cardName?: string }) => {
    console.log('params: ');
    if (params.cardId) {
      this.props.onChangeCard(params.cardId);
    }

    if (params.cardName) {
      this.props.onChangeCardName(params.cardName);
    }
  };

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
      type,
      boards,
      pipelines,
      stages,
      cards,
      boardId,
      pipelineId,
      stageId,
      onChangeBoard,
      onChangePipeline,
      onChangeStage,
      callback
    } = this.props;

    console.log('cards: ', cards);

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
          <ControlLabel>{type}</ControlLabel>
          <CardAutoCompletion
            required={true}
            defaultValue={''}
            defaultOptions={cards}
            autoCompletionType={type}
            placeholder="asd"
            onChange={this.onCardChange}
          />
        </FormGroup>
      </>
    );
  }

  render() {
    return <FormContainer>{this.renderContent()}</FormContainer>;
  }
}

export default BoardSelect;

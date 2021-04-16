import { IBoard, IPipeline } from 'modules/boards/types';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { IOption } from 'modules/common/types';
import React from 'react';
import Select from 'react-select-plus';
import { __ } from '../../../common/utils';
import { FlexRow } from 'modules/settings/integrations/styles';

type Props = {
  boards: IBoard[];
  pipelines: IPipeline[];
  onChangeBoard?: (value: string) => any;
  onChangePipelines?: (values: string[]) => any;
  selectedBoardId?: string;
  selectedPipelineIds?: string[];
};

class SelectBoards extends React.Component<Props, {}> {
  getPipelines = (boardId: string) => {
    const board = this.props.boards.find(e => e._id === boardId);

    return (board && board.pipelines) || [];
  };

  generateBoardOptions(array: IBoard[] = []): IOption[] {
    return array.map(item => {
      const board = item || ({} as IBoard);

      return {
        value: board._id,
        label: board.name
      };
    });
  }

  generatePipeLineOptions(array: IPipeline[] = []): IOption[] {
    return array.map(item => {
      const pipeLine = item || ({} as IPipeline);

      return {
        value: pipeLine._id,
        label: pipeLine.name
      };
    });
  }

  onChangeBoard = option => {
    if (this.props.onChangeBoard) {
      const boardId = !option ? '' : option.value;

      this.state = {
        pipelines: this.getPipelines(boardId)
      };
      this.props.onChangeBoard(boardId);
    }

    console.log(this.state);
  };

  onChangePipeline = values => {
    if (this.props.onChangePipelines) {
      this.props.onChangePipelines(values.map(item => item.value) || []);
    }
  };

  render() {
    const {
      boards,
      selectedBoardId,
      selectedPipelineIds,
      pipelines
    } = this.props;

    return (
      <FormGroup>
        <ControlLabel>{'Board & PipeLines'}</ControlLabel>
        <p>{__('In which Board(s) do you want to add this property group?')}</p>

        <FlexRow>
          <Select
            className="flex-item"
            placeholder={__('Select board')}
            value={selectedBoardId}
            onChange={this.onChangeBoard}
            options={this.generateBoardOptions(boards)}
            multi={false}
          />
          <Select
            className="flex-item"
            placeholder={__('Select pipelines')}
            value={selectedPipelineIds}
            onChange={this.onChangePipeline}
            options={this.generatePipeLineOptions(pipelines)}
            multi={true}
          />
        </FlexRow>
      </FormGroup>
    );
  }
}

export default SelectBoards;

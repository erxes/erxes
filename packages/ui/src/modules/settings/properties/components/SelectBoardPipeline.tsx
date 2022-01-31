import { IBoard, IPipeline } from 'modules/boards/types';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { IOption } from 'modules/common/types';
import React from 'react';
import Select from 'react-select-plus';
import { __ } from '../../../common/utils';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import { IBoardSelectItem } from '../types';
import { LinkButton } from 'modules/settings/team/styles';
import { FlexRow } from '../styles';

type Props = {
  boards: IBoard[];
  onChangeItems: (items: IBoardSelectItem[]) => any;
  selectedItems: IBoardSelectItem[];
};

type State = {
  selectItems: IBoardSelectItem[];
};

class SelectBoards extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    let selectItems: IBoardSelectItem[] = [
      { _id: Math.random().toString(), boardId: '', pipelineIds: [] }
    ];

    if (props.selectedItems && this.props.selectedItems.length > 0) {
      selectItems = this.props.selectedItems.map(e => ({
        _id: Math.random().toString(),
        ...e
      }));
    }

    this.state = {
      selectItems
    };
  }

  getPipeLines(boardId) {
    const board = this.props.boards.find(e => e._id === boardId);

    return (board && board.pipelines) || [];
  }

  generateBoardOptions(array: IBoard[] = []): IOption[] {
    const idsToFilter = this.state.selectItems.map(e => e.boardId);
    return array.map(item => {
      const board = item || ({} as IBoard);
      let disabled = false;

      if (idsToFilter.includes(board._id)) {
        disabled = true;
      }

      return {
        value: board._id,
        label: board.name,
        disabled
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

  onChangeBoard = (itemId, boardId) => {
    const { selectItems } = this.state;

    // find current editing one
    const item = selectItems.find(e => e._id === itemId) || {
      _id: itemId,
      boardId: '',
      pipelineIds: [],
      pipelineOptions: []
    };

    // set new value
    item.boardId = boardId;

    this.setState({ selectItems });

    this.props.onChangeItems(selectItems);
  };

  onChangePipeline = (itemId, pipelines) => {
    const { selectItems } = this.state;
    const pipeLineIds = pipelines.map(e => e.value) || [];
    // find current editing one
    const item = selectItems.find(e => e._id === itemId) || {
      _id: itemId,
      boardId: '',
      pipelineIds: []
    };

    // set new value
    item.pipelineIds = pipeLineIds;

    this.setState({ selectItems });

    this.props.onChangeItems(selectItems);
  };

  addNew = () => {
    const selectItems = this.state.selectItems.slice();

    selectItems.push({
      _id: Math.random().toString(),
      boardId: '',
      pipelineIds: []
    });

    this.setState({ selectItems });
  };

  removeItem = itemId => {
    let { selectItems } = this.state;

    selectItems = selectItems.filter(e => e._id !== itemId);

    this.setState({ selectItems });

    this.props.onChangeItems(selectItems);
  };

  renderSelect(selectItem: IBoardSelectItem) {
    const { _id, boardId, pipelineIds } = selectItem;

    const pipelineOptions = this.getPipeLines(boardId);

    const onBoardChange = e => {
      this.onChangeBoard(_id, e.value);
    };

    const onPipelineChange = e => {
      this.onChangePipeline(_id, e);
    };

    const remove = () => {
      this.removeItem(_id);
    };

    return (
      <FlexRow key={_id}>
        <Select
          className="flex-item"
          placeholder={__('Select board')}
          value={boardId}
          onChange={onBoardChange}
          options={this.generateBoardOptions(this.props.boards)}
          multi={false}
        />
        <Select
          className="flex-item"
          placeholder={__('Select pipelines')}
          value={pipelineIds}
          onChange={onPipelineChange}
          options={this.generatePipeLineOptions(pipelineOptions)}
          multi={true}
        />

        <Button btnStyle="link" size="small" onClick={remove} icon="times" />
      </FlexRow>
    );
  }

  render() {
    return (
      <FormGroup>
        <ControlLabel>{'Board & PipeLines'}</ControlLabel>
        <p>{__('In which Board(s) do you want to add this property group?')}</p>

        {this.state.selectItems.map(item => this.renderSelect(item))}
        <br />

        <LinkButton onClick={this.addNew}>
          <Icon icon="plus-1" /> {__('Add another board')}
        </LinkButton>
      </FormGroup>
    );
  }
}

export default SelectBoards;

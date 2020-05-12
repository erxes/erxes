import { PipelinePopoverContent } from 'modules/boards/styles/item';
import Chooser, { CommonProps } from 'modules/common/components/Chooser';
import Icon from 'modules/common/components/Icon';
import { Select } from 'modules/common/styles/chooser';
import { __ } from 'modules/common/utils';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import BoardSelect from '../../containers/BoardSelect';

type Props = {
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
  filterStageId?: (
    stageId?: string,
    boardId?: string,
    pipelineId?: string
  ) => void;
} & CommonProps;

type State = {
  stageId: string;
  boardId: string;
  pipelineId: string;
};

class ItemChooser extends React.Component<Props, State> {
  private ref;

  constructor(props) {
    super(props);

    this.ref = React.createRef();
    const { stageId, boardId, pipelineId } = props;

    this.state = {
      stageId: stageId || '',
      boardId: boardId || '',
      pipelineId: pipelineId || ''
    };
  }

  onOverlayClose = () => {
    this.ref.hide();
  };

  clearFilter = e => {
    e.stopPropagation();
    this.onChangeField('stageId', '');
    this.onChangeField('pipelineId', '');
    this.onChangeField('boardId', '');
  };

  renderBoardSelect() {
    const { data } = this.props;
    const { stageId, pipelineId, boardId } = this.state;

    const stgIdOnChange = stgId => this.onChangeField('stageId', stgId);
    const plIdOnChange = plId => this.onChangeField('pipelineId', plId);
    const brIdOnChange = brId => this.onChangeField('boardId', brId);

    return (
      <Popover id="board-popover">
        <PipelinePopoverContent>
          <BoardSelect
            type={data.options.type}
            stageId={stageId}
            pipelineId={pipelineId}
            boardId={boardId}
            onChangeStage={stgIdOnChange}
            onChangePipeline={plIdOnChange}
            onChangeBoard={brIdOnChange}
          />
        </PipelinePopoverContent>
      </Popover>
    );
  }

  renderSelectChooser = () => {
    const { stageId, pipelineId, boardId } = this.state;

    const filtered = stageId || pipelineId || boardId;

    return (
      <div>
        <OverlayTrigger
          ref={overlayTrigger => {
            this.ref = overlayTrigger;
          }}
          trigger="click"
          placement="bottom-start"
          overlay={this.renderBoardSelect()}
          rootClose={true}
          container={this}
        >
          <Select>
            {__('Filter')}
            <span>
              {filtered && <Icon icon="times" onClick={this.clearFilter} />}
              <Icon icon="angle-down" />
            </span>
          </Select>
        </OverlayTrigger>
      </div>
    );
  };

  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    const { filterStageId } = this.props;

    if (name === 'stageId' && filterStageId) {
      filterStageId(value as string, this.state.boardId, this.state.pipelineId);
    }

    this.setState(({ [name]: value } as unknown) as Pick<State, keyof State>);
  };

  render() {
    return <Chooser {...this.props} renderFilter={this.renderSelectChooser} />;
  }
}

export default ItemChooser;

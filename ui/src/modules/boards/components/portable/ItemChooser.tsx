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
  showSelect?: boolean;
  filterStageId?: (
    stageId?: string,
    boardId?: string,
    pipelineId?: string
  ) => void;
  onSelect: (datas: any[]) => void;
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

    this.state = {
      stageId: this.props.stageId || '',
      boardId: this.props.boardId || '',
      pipelineId: this.props.pipelineId || ''
    };
  }

  clearFilter = e => {
    e.stopPropagation();
    this.onChangeField('stageId', '');
    this.onChangeField('pipelineId', '');
    this.onChangeField('boardId', '');
  };

  renderSelectChooser = () => {
    const { showSelect, data } = this.props;

    if (!showSelect) {
      return null;
    }

    const { stageId, pipelineId, boardId } = this.state;

    const filtered = stageId || pipelineId || boardId;

    const stgIdOnChange = stgId => this.onChangeField('stageId', stgId);
    const plIdOnChange = plId => this.onChangeField('pipelineId', plId);
    const brIdOnChange = brId => this.onChangeField('boardId', brId);

    const content = (
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

    return (
      <div ref={this.ref}>
        <OverlayTrigger
          trigger="click"
          placement="bottom-start"
          overlay={content}
          rootClose={true}
          container={this.ref.current}
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

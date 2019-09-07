import Chooser, { CommonProps } from 'modules/common/components/Chooser';
import { SelectChooser } from 'modules/common/styles/chooser';
import React from 'react';
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
  constructor(props) {
    super(props);

    this.state = {
      stageId: this.props.stageId || '',
      boardId: this.props.boardId || '',
      pipelineId: this.props.pipelineId || ''
    };
  }

  renderSelectChooser = () => {
    const { showSelect, data } = this.props;

    if (!showSelect) {
      return null;
    }

    const { stageId, pipelineId, boardId } = this.state;

    const stgIdOnChange = stgId => this.onChangeField('stageId', stgId);
    const plIdOnChange = plId => this.onChangeField('pipelineId', plId);
    const brIdOnChange = brId => this.onChangeField('boardId', brId);

    return (
      <SelectChooser>
        <BoardSelect
          inSidebar={true}
          type={data.options.type}
          stageId={stageId}
          pipelineId={pipelineId}
          boardId={boardId}
          onChangeStage={stgIdOnChange}
          onChangePipeline={plIdOnChange}
          onChangeBoard={brIdOnChange}
        />
      </SelectChooser>
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
    return <Chooser {...this.props} renderSidebar={this.renderSelectChooser} />;
  }
}

export default ItemChooser;

import PipelineSelector from 'modules/boards/containers/PipelineSelector';
import { Title } from 'modules/boards/styles/label';
import { ActionList } from 'modules/boards/styles/stage';
import { IOptions, IStage, IStageRefetchParams } from 'modules/boards/types';
import Icon from 'modules/common/components/Icon';
import * as React from 'react';
import { Popover } from 'react-bootstrap';

type Props = {
  archiveItems: () => void;
  archiveList: () => void;
  options: IOptions;
  queryParams: any;
  stage: IStage;
  refetchStages: (params: IStageRefetchParams) => Promise<any>;
  onClosePopover: () => void;
};

type State = {
  showForm: boolean;
  type?: string;
};

export default class Overlay extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showForm: false
    };
  }

  copyList = () => {
    this.setState({ type: 'Copy', showForm: true });
  };

  moveList = () => {
    this.setState({ type: 'Move', showForm: true });
  };

  onChangeForm = () => {
    this.setState({ showForm: !this.state.showForm });
  };

  componentDidMount() {
    const elm = document.getElementById('stage-popover');

    if (elm) {
      elm.className = 'popover bottom';
      elm.style.marginTop = '26px';
    }
  }

  renderCopyMoveTrigger() {
    const { options, stage, refetchStages, queryParams } = this.props;
    const { type } = this.state;

    let action: string = '';

    if (type === 'Copy') {
      action = 'Copy';
    }

    if (type === 'Move') {
      action = 'Move';
    }

    const pipelineProps = {
      type: options.type,
      action,
      stageId: stage._id,
      refetchStages,
      pipelineId: queryParams.pipelineId,
      boardId: queryParams.boardId
    };

    return <PipelineSelector {...pipelineProps} />;
  }

  archiveList = () => {
    const { archiveList, onClosePopover } = this.props;
    archiveList();
    onClosePopover();
  };

  archiveItems = () => {
    const { archiveItems, onClosePopover } = this.props;
    archiveItems();
    onClosePopover();
  };

  renderPopover() {
    const { showForm } = this.state;

    if (showForm) {
      return this.renderCopyMoveTrigger();
    }

    return (
      <ActionList>
        <li onClick={this.copyList} key="copy-list">
          Copy List
        </li>
        <li onClick={this.moveList} key="move-list">
          Move List
        </li>
        <li onClick={this.archiveItems} key="archive-items">
          Archive All Cards in This List
        </li>
        <li onClick={this.archiveList} key="archive-list">
          Archive This List
        </li>
      </ActionList>
    );
  }

  render() {
    const { showForm, type } = this.state;

    const typeTitle = type === 'Copy' ? 'Copy List' : 'Move List';

    return (
      <Popover id="stage-popover">
        <Title>
          {showForm && <Icon icon="arrow-left" onClick={this.onChangeForm} />}
          {showForm ? typeTitle : 'Action List'}
          <Icon icon="times" onClick={this.props.onClosePopover} />
        </Title>
        {this.renderPopover()}
      </Popover>
    );
  }
}

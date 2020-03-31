import PipelineSelector from 'modules/boards/containers/PipelineSelector';
import { Title } from 'modules/boards/styles/label';
import { ActionList } from 'modules/boards/styles/stage';
import { IOptions, IStage, IStageRefetchParams } from 'modules/boards/types';
import Icon from 'modules/common/components/Icon';
import { dimensions } from 'modules/common/styles';
import { Divider } from 'modules/settings/main/styles';
import * as React from 'react';
import { Popover } from 'react-bootstrap';
import styled from 'styled-components';
import { STAGE_ACTIONS } from '../../constants';

const MenuDivider = styled(Divider)`
  margin: ${dimensions.unitSpacing}px 0 ${dimensions.unitSpacing}px;
  padding: 0;
`;

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
  action: string;
};

export default class Overlay extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showForm: false,
      action: ''
    };
  }

  copyList = () => {
    this.setState({ action: STAGE_ACTIONS.COPY, showForm: true });
  };

  moveList = () => {
    this.setState({ action: STAGE_ACTIONS.MOVE, showForm: true });
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
    const { options, stage, refetchStages, queryParams, onClosePopover } = this.props;

    const pipelineProps = {
      type: options.type,
      action: this.state.action,
      stageId: stage._id,
      refetchStages,
      pipelineId: queryParams.pipelineId,
      boardId: queryParams.id,
      onClosePopover
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
        <MenuDivider />
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
    const { showForm, action } = this.state;

    const actionTitle = action === STAGE_ACTIONS.COPY ? 'Copy List' : 'Move List';

    return (
      <Popover id="stage-popover">
        <Title>
          {showForm && <Icon icon="arrow-left" onClick={this.onChangeForm} />}
          {showForm ? actionTitle : 'Action List'}
          <Icon icon="times" onClick={this.props.onClosePopover} />
        </Title>
        {this.renderPopover()}
      </Popover>
    );
  }
}

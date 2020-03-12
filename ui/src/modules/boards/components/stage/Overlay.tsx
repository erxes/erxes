import PipelineSelector from 'modules/boards/containers/PipelineSelector';
import { Title } from 'modules/boards/styles/label';
import { ActionList } from 'modules/boards/styles/stage';
import { IOptions, IStage, IStageRefetchParams } from 'modules/boards/types';
import Icon from 'modules/common/components/Icon';
import React, { useEffect, useState } from 'react';
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

export default function Overlay(props: Props) {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('');

  const copyList = () => {
    setShowForm(true);
    setType('Copy');
  };

  const moveList = () => {
    setShowForm(true);
    setType('Move');
  };

  const onChangeForm = () => {
    setShowForm(!showForm);
  };

  useEffect(() => {
    const elm = document.getElementById('stage-popover');

    if (elm) {
      elm.className = 'popover bottom';
      elm.style.marginTop = '26px';
    }
  });

  function renderCopyMoveTrigger() {
    const { options, stage, refetchStages, queryParams } = props;

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

  function renderPopover() {
    if (showForm) {
      return renderCopyMoveTrigger();
    }

    const archiveList = () => {
      props.archiveList();
      props.onClosePopover();
    };

    const archiveItems = () => {
      props.archiveItems();
      props.onClosePopover();
    };

    return (
      <ActionList>
        <li onClick={copyList} key="copy-list">
          Copy List
        </li>
        <li onClick={moveList} key="move-list">
          Move List
        </li>
        <li onClick={archiveItems} key="archive-items">
          Archive All Cards in This List
        </li>
        <li onClick={archiveList} key="archive-list">
          Archive This List
        </li>
      </ActionList>
    );
  }

  const typeTitle = type === 'Copy' ? 'Copy List' : 'Move List';

  return (
    <Popover id="stage-popover">
      <Title>
        {showForm && <Icon icon="arrow-left" onClick={onChangeForm} />}
        {showForm ? typeTitle : 'Action List'}
        <Icon icon="times" onClick={props.onClosePopover} />
      </Title>
      {renderPopover()}
    </Popover>
  );
}

import { AutomationConstants, IAutomation, IAutomationNote } from '../../types';
import {
  BRANCH_HANDLE_OPTIONS,
  DEFAULT_HANDLE_OPTIONS,
  DEFAULT_HANDLE_STYLE
} from './constants';
import { ScratchNode as CommonScratchNode, Trigger } from './styles';
import { Handle, NodeToolbar, Position } from 'reactflow';
import React, { memo, useState } from 'react';

import CommonForm from '@erxes/ui/src/components/form/Form';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import NoteFormContainer from '../../containers/forms/NoteForm';
import { __ } from '@erxes/ui/src/utils/core';
import { checkNote } from './utils';
import colors from '@erxes/ui/src/styles/colors';
import { renderDynamicComponent } from '../../utils';
import { ToolBarRemoveBtn, ToolbarNoteBtn } from '../../styles';

const showHandler = (data, option) => {
  if (data.nodeType === 'trigger' && ['left'].includes(option.id)) {
    return false;
  }

  return true;
};

type Props = {
  id: string;
  data: {
    automation: IAutomation;
    automationNotes?: IAutomationNote[];
    type: string;
    nodeType: string;
    actionType: string;
    triggerType?: string;
    icon: string;
    label: string;
    description: string;
    config: any;
    toggleDrawer: ({
      type,
      awaitingNodeId
    }: {
      type: string;
      awaitingNodeId?: string;
    }) => void;
    onDoubleClick: (type: string, id: string) => void;
    removeItem: (type: string, id: string) => void;
    constants: AutomationConstants;
    forceToolbarVisible: boolean;
    toolbarPosition: Position;
    additionalContent?: (id: string, type: string) => React.ReactNode;
  };
  selected: boolean;
};

type HandleProps = {
  id: string;
  position: any;
  style: any;
  label?: string;
  labelStyle?: any;
};

export const ScratchNode = ({ data }: Props) => {
  const { toggleDrawer } = data;

  return (
    <CommonScratchNode onClick={toggleDrawer.bind(this, { type: 'triggers' })}>
      <Icon icon="file-plus" size={25} />
      <p>{__('How do you want to trigger this automation')}?</p>
    </CommonScratchNode>
  );
};

const renderTriggerContent = (
  constants: any[] = [],
  nodeType,
  type,
  config
) => {
  if (nodeType !== 'trigger') {
    return null;
  }
  const constant = (constants || []).find(c => c.type === type);

  if (!!constant?.isCustom) {
    return (
      <div className="triggerContent">
        {renderDynamicComponent(
          {
            componentType: 'triggerContent',
            config,
            constant,
            triggerType: type
          },
          constant.type
        )}
      </div>
    );
  }

  return null;
};

export default memo(({ id, data, selected }: Props) => {
  const [isHovered, setIsHovered] = useState(false);

  const {
    toggleDrawer,
    onDoubleClick,
    removeItem,
    constants,
    config,
    additionalContent
  } = data;

  const onMouseEnter = () => {
    setIsHovered(true);
  };

  const onMouseLeave = () => {
    setIsHovered(false);
  };

  const handleOnClick = ({
    optionId,
    isOptionalConnect
  }: {
    optionId: string;
    isOptionalConnect?: boolean;
  }) => {
    if (optionId.includes('right')) {
      toggleDrawer({
        type: `actions`,
        awaitingNodeId: isOptionalConnect ? optionId.replace('-right', '') : id
      });
    }
  };

  const handleDoubleClick = () => {
    onDoubleClick(data.nodeType, id);
  };

  const removeNode = e => {
    e.persist();
    removeItem(data.nodeType, id);
  };

  const renderNote = () => {
    const content = ({ closeModal }) => {
      const { automation, automationNotes = [] } = data;

      return (
        <CommonForm
          renderContent={formProps => (
            <NoteFormContainer
              formProps={formProps}
              automationId={automation?._id || ''}
              isEdit={true}
              itemId={id}
              notes={checkNote(automationNotes, id)}
              closeModal={closeModal}
            />
          )}
        />
      );
    };

    const trigger = (
      <ToolbarNoteBtn
        className="icon-notes add-note"
        title={__('Write Note')}
      />
    );

    return (
      <ModalTrigger content={content} trigger={trigger} title="" hideHeader />
    );
  };

  const renderOptionalContent = () => {
    if (!data.nodeType) {
      return;
    }

    const constant = (constants[`${data.nodeType}sConst`] || []).find(
      c => c.type === data[`${data.nodeType}Type`]
    );

    if (!constant || !constant?.isAvailableOptionalConnect) {
      return null;
    }

    const handle = optionalId => (
      <Handle
        key={`${id}-${optionalId}-right`}
        id={`${id}-${optionalId}-right`}
        type="source"
        position={Position.Right}
        onClick={handleOnClick.bind(this, {
          optionId: `${id}-${optionalId}-right`,
          isOptionalConnect: true
        })}
        isConnectable
        title="optional-connect"
        style={{
          right: '20px',
          width: 15,
          height: 15,
          backgroundColor: colors.colorWhite,
          border: `2px solid ${colors.colorCoreGray}`,
          zIndex: 4
        }}
      />
    );

    return (
      <div className="optional-connects">
        {renderDynamicComponent(
          {
            componentType: 'optionalContent',
            data,
            handle
          },
          constant.type
        )}
      </div>
    );
  };

  const handleOptions: HandleProps[] =
    data?.actionType === 'if' ? BRANCH_HANDLE_OPTIONS : DEFAULT_HANDLE_OPTIONS;

  return (
    <>
      <Trigger
        type={data.nodeType}
        $isHoverActionBar={isHovered}
        $isSelected={selected}
        key={id}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="header">
          <NodeToolbar
            isVisible={data.forceToolbarVisible || undefined}
            position={data.toolbarPosition}
          >
            {renderNote()}
            <ToolBarRemoveBtn
              onClick={removeNode}
              className="icon-trash-alt"
              title={__('Delete')}
            />
          </NodeToolbar>
          {additionalContent && (
            <NodeToolbar isVisible position={Position.Top}>
              {additionalContent(id, data.nodeType)}
            </NodeToolbar>
          )}
          <div>
            <i className={`icon-${data.icon}`} />
            {data.label}
          </div>
        </div>
        <NodeToolbar
          isVisible={data.forceToolbarVisible || undefined}
          position={data.toolbarPosition}
        ></NodeToolbar>
        {renderOptionalContent()}
        {renderTriggerContent(
          constants.triggersConst,
          data.nodeType,
          data.triggerType,
          config
        )}
        <p>{data.description}</p>
      </Trigger>
      {handleOptions.map(
        option =>
          showHandler(data, option) && (
            <Handle
              key={option.id}
              type="source"
              position={option.position}
              id={option.id}
              onClick={handleOnClick.bind(this, { optionId: option.id })}
              style={{ ...DEFAULT_HANDLE_STYLE, ...option.style }}
            >
              {option?.label && (
                <div
                  style={{
                    ...option.labelStyle,
                    color: option.style.background
                  }}
                >
                  {option.label}
                </div>
              )}
            </Handle>
          )
      )}
    </>
  );
});

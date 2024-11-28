import React, { memo, useState } from 'react';
import { Handle, NodeProps, NodeToolbar, Position } from 'reactflow';
import {
  BRANCH_HANDLE_OPTIONS,
  DEFAULT_HANDLE_OPTIONS,
  DEFAULT_HANDLE_STYLE
} from '../constants';
import { Trigger } from '../styles';

import CommonForm from '@erxes/ui/src/components/form/Form';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import colors from '@erxes/ui/src/styles/colors';
import { __ } from '@erxes/ui/src/utils/core';
import NoteFormContainer from '../../../containers/forms/NoteForm';
import { ToolBarRemoveBtn, ToolbarBtn } from '../../../styles';
import { renderDynamicComponent } from '../../../utils';
import { checkNote } from '../utils';
import EmailTemplate from '@erxes/ui-emailtemplates/src/containers/EmailTemplate';
import ErrorBoundary from '@erxes/ui/src/components/ErrorBoundary';

const showHandler = (data, option) => {
  if (data.nodeType === 'trigger' && ['left'].includes(option.id)) {
    return false;
  }

  return true;
};

type HandleProps = {
  id: string;
  position: any;
  style: any;
  label?: string;
  labelStyle?: any;
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

const renderActionContent = ({ constants, nodeType, actionType, config }) => {
  if (nodeType !== 'action') {
    return null;
  }

  const constant = (constants || []).find(c => c.type === actionType);

  if (actionType == 'sendEmail') {
    return <EmailTemplate templateId={config?.templateId} onlyPreview />;
  }

  if (constant?.hasNodeAdditionalContent) {
    return (
      <div className="actionContent">
        {renderDynamicComponent(
          {
            componentType: 'actionContent',
            config,
            constant,
            actionType
          },
          constant.type
        )}
      </div>
    );
  }

  return null;
};

export default memo(({ id, data, selected }: NodeProps) => {
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
      <ToolbarBtn
        className="icon-notes add-note"
        title={__('Write Note')}
        $color={colors.colorSecondary}
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
    <ErrorBoundary>
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

        {renderOptionalContent()}
        {renderTriggerContent(
          constants.triggersConst,
          data.nodeType,
          data.triggerType,
          config
        )}
        {renderActionContent({
          constants: constants.actionsConst,
          nodeType: data.nodeType,
          actionType: data.actionType,
          config
        })}
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
    </ErrorBoundary>
  );
});

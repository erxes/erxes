import { __, colors } from '@erxes/ui/src';
import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';

import { DEFAULT_HANDLE_OPTIONS, DEFAULT_HANDLE_STYLE } from './constants';
import { Trigger } from './styles';
import { renderDynamicComponent } from '../../utils';
import { AutomationConstants } from '../../types';

const showHandler = (data, option) => {
  if (data.nodeType === 'trigger' && ['left'].includes(option.id)) {
    return false;
  }

  return true;
};

type Props = {
  id: string;
  data: {
    type: string;
    nodeType: string;
    icon: string;
    label: string;
    description: string;
    toggleDrawer: ({
      type,
      awaitingActionId
    }: {
      type: string;
      awaitingActionId?: string;
    }) => void;
    onDoubleClick: (type: string, id: string) => void;
    removeItem: (type: string, id: string) => void;
    constants: AutomationConstants;
  };
};

export default memo(({ id, data }: Props) => {
  const [isHovered, setIsHovered] = useState(false);

  const { toggleDrawer, onDoubleClick, removeItem, constants } = data;

  const onMouseEnter = () => {
    setIsHovered(true);
  };

  const onMouseLeave = () => {
    setIsHovered(false);
  };

  const handleOnClick = (optionId, isOptionalConnect) => {
    if (optionId.includes('right')) {
      toggleDrawer({
        type: `actions`,
        awaitingActionId: isOptionalConnect
          ? optionId.replace('-right', '')
          : id
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

  const renderOptionalContent = () => {
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
        onClick={handleOnClick.bind(this, `${id}-${optionalId}-right`)}
        isConnectable
        style={{
          right: '20px',
          width: 10,
          height: 10,
          backgroundColor: colors.colorShadowGray,
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

  return (
    <>
      <Trigger
        type={data.nodeType}
        isHoverActionBar={isHovered}
        key={id}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="header">
          <div className="custom-menu">
            <div>
              <i className="icon-notes add-note" title={__('Write Note')}></i>
              <i
                className="icon-trash-alt delete-control"
                onClick={removeNode}
                title={__('Delete')}
              ></i>
            </div>
          </div>
          <div>
            <i className={`icon-${data.icon}`} />
            {data.label}
          </div>
        </div>

        {renderOptionalContent()}

        <p>{data.description}</p>
      </Trigger>
      {DEFAULT_HANDLE_OPTIONS.map(
        option =>
          showHandler(data, option) && (
            <Handle
              key={option.id}
              type="source"
              position={option.position}
              id={option.id}
              onClick={handleOnClick.bind(this, option.id)}
              style={{ ...DEFAULT_HANDLE_STYLE, ...option.style }}
            />
          )
      )}
    </>
  );
});

import { gql, useQuery } from '@apollo/client';
import { IAction } from '@erxes/ui-automations/src/types';
import { __, color, colors, Spinner } from '@erxes/ui/src';
import CommonForm from '@erxes/ui/src/components/form/Form';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React, { memo, useState } from 'react';
import { Handle, NodeToolbar, Position } from 'reactflow';
import NoteFormContainer from '../../../containers/forms/NoteForm';
import { queries } from '../../../graphql';
import { ToolbarBtn, ToolBarRemoveBtn, ToolbarText } from '../../../styles';
import { IAutomation } from '../../../types';
import { DEFAULT_HANDLE_OPTIONS, DEFAULT_HANDLE_STYLE } from '../constants';
import { Trigger } from '../styles';
import { NodeProps } from '../types';
import { checkNote } from '../utils';

const calculateWorkflowNodeHeightWidth = (actions: IAction[]) => {
  if (actions?.length === 1) {
    return { width: 350, height: 200 };
  }

  const initialExtents = {
    largestX: -Infinity,
    lowestX: Infinity,
    largestY: -Infinity,
    lowestY: Infinity
  };

  const extents = actions.reduce((acc, action) => {
    const { x, y } = action.position || {};

    // Update general extents
    acc.largestX = Math.max(acc.largestX, x);
    acc.lowestX = Math.min(acc.lowestX, x);
    acc.largestY = Math.max(acc.largestY, y);
    acc.lowestY = Math.min(acc.lowestY, y);

    return acc;
  }, initialExtents);

  const width = extents.largestX - extents.lowestX;
  const height = extents.largestY - extents.lowestY;

  return { width, height };
};

function WorkflowNode({ id, data, selected, xPos, yPos }: NodeProps) {
  const { config, addWorkFlowAction, removeWorkFlowAction } = data;

  const [isExpanded, setExpand] = useState(false);

  if (!config?.workflowId) {
    return (
      <Trigger type="workflow" style={{ marginLeft: 0 }}>
        <div className="header">
          <NodeToolbar
            isVisible={data.forceToolbarVisible || undefined}
            position={data.toolbarPosition}
          >
            <ToolBarRemoveBtn
              onClick={() => data.removeItem(data.nodeType, id)}
              className="icon-trash-alt"
              title={__('Delete')}
            />
          </NodeToolbar>
          {__(`Can't load workflow`)}
        </div>
        <p>{__('Please select workflow after check workflow exists')}</p>
      </Trigger>
    );
  }
  const {
    data: queryData,
    loading,
    error,
    refetch
  } = useQuery(gql(queries.automationDetail), {
    variables: { _id: config.workflowId }
  });

  if (error) {
    return <>{JSON.stringify(error)}</>;
  }

  if (loading) {
    return <Spinner />;
  }

  const { actions, name } = (queryData?.automationDetail || {}) as IAutomation;

  const addWorkflowNodes = (height: number) => {
    const centerY = height / 2;

    let updatedActions: any[] = [];

    const sortedActionsByX = [...actions].sort((a, b) => {
      if (a?.position?.x === b?.position?.x) {
        return a?.position?.y - b?.position?.y;
      }
      return a?.position?.x - b?.position?.x;
    });

    sortedActionsByX.forEach((action, i) => {
      if (i === 0) {
        updatedActions.push({
          ...action,
          position: { x: xPos, y: (action.position.y + centerY) * -1 }
        });
      } else {
        const prevAction = updatedActions[i - 1];

        updatedActions.push({
          ...action,
          position: {
            x: prevAction.position.x + 350,
            y: (action.position.y + centerY) * -1
          }
        });
      }
    });

    addWorkFlowAction && addWorkFlowAction(id, updatedActions);
  };

  const removeWorkflowNodes = () => {
    removeWorkFlowAction && removeWorkFlowAction(id);
  };

  const { height } = calculateWorkflowNodeHeightWidth(actions || []);

  const removeNode = e => {
    e.persist();
    removeWorkflowNodes();
    data.removeItem(data.nodeType, id);
  };

  const handleExpand = () => {
    if (!isExpanded) {
      addWorkflowNodes(height);
    } else {
      removeWorkflowNodes();
    }

    setExpand(!isExpanded);
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

  const refreshActions = () => {
    refetch().then(() => {
      addWorkflowNodes(height);
    });
  };

  return (
    <>
      {!selected && (
        <NodeToolbar
          isVisible={true}
          position={Position.Top}
          align={isExpanded ? 'start' : 'center'}
        >
          <ToolbarBtn
            onClick={handleExpand}
            className={
              isExpanded ? 'icon-compress-arrows' : 'icon-expand-arrows-alt'
            }
            $color={colors.colorSecondary}
            title={isExpanded ? 'Compress' : `Expand`}
          />

          {isExpanded && (
            <>
              <ToolbarBtn
                onClick={() =>
                  window.open(
                    `/automations/details/${config.workflowId}`,
                    '__blank'
                  )
                }
                className="icon-edit-1"
                $color={colors.colorPrimary}
                title="Edit"
              />
              <ToolbarBtn
                onClick={refreshActions}
                className="icon-refresh"
                $color={colors.colorCoreBlack}
                title="Refresh"
              />
              <ToolbarText>{name}</ToolbarText>
            </>
          )}
        </NodeToolbar>
      )}
      {!isExpanded && (
        <>
          <Trigger type="workflow" style={{ marginLeft: 0 }}>
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
              <div>
                <i className={`icon-glass-martini-alt`} />
                {'WorkFlow'}
              </div>
            </div>
            <p>{name}</p>
          </Trigger>
          {DEFAULT_HANDLE_OPTIONS.map(option => (
            <Handle
              key={option.id}
              type="source"
              position={option.position}
              id={option.id}
              // onClick={handleOnClick.bind(this, { optionId: option.id })}
              style={{ ...DEFAULT_HANDLE_STYLE, ...option.style }}
            />
          ))}
        </>
      )}
    </>
  );
}

export default memo(WorkflowNode);

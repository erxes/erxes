import { gql, useQuery } from '@apollo/client';
import { IAction } from '@erxes/ui-automations/src/types';
import { __, Spinner } from '@erxes/ui/src';
import CommonForm from '@erxes/ui/src/components/form/Form';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React, { memo, useState } from 'react';
import { Handle, NodeToolbar, Position } from 'reactflow';
import NoteFormContainer from '../../../containers/forms/NoteForm';
import { queries } from '../../../graphql';
import { ToolbarNoteBtn, ToolBarRemoveBtn } from '../../../styles';
import { IAutomation } from '../../../types';
import { DEFAULT_HANDLE_OPTIONS, DEFAULT_HANDLE_STYLE } from '../constants';
import { Trigger } from '../styles';
import { NodeProps } from '../types';
import { checkNote } from '../utils';

const calculateWorkflowNodeHeightWidth = (actions: IAction[]) => {
  const initialExtents = {
    largestX: -Infinity,
    lowestX: Infinity,
    largestY: -Infinity,
    lowestY: Infinity
  };

  const extents = actions.reduce((acc, action) => {
    const { x, y } = action.position;

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

  const {
    data: queryData,
    loading,
    error
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

  const addWorkflowNodes = (width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;

    const updatedActions = actions.map((action, i) => {
      return {
        ...action,
        position: {
          x: centerX + xPos + action?.position?.x,
          y: (action?.position?.y + centerY) * -1
        }
      };
    });

    addWorkFlowAction && addWorkFlowAction(id, updatedActions);
  };

  const removeWorkflowNodes = () => {
    removeWorkFlowAction && removeWorkFlowAction(id);
  };

  const { width, height } = calculateWorkflowNodeHeightWidth(actions || []);

  const removeNode = (e) => {
    e.persist();
    removeWorkflowNodes();
    data.removeItem(data.nodeType, id);
  };

  const handleExpand = () => {
    if (!isExpanded) {
      addWorkflowNodes(width, height);
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
          renderContent={(formProps) => (
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

  return (
    <>
      <NodeToolbar isVisible={true} position={Position.Top}>
        <ToolbarNoteBtn
          onClick={handleExpand}
          className={
            isExpanded ? 'icon-compress-arrows' : 'icon-expand-arrows-alt'
          }
        />
      </NodeToolbar>
      {!isExpanded && (
        <>
          <Trigger type="trigger" style={{ marginLeft: 0 }}>
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
          {DEFAULT_HANDLE_OPTIONS.map((option) => (
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

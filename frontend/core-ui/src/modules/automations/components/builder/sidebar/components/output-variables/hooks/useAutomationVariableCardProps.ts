import type React from 'react';
import { setAutomationVariableDragData } from 'ui-modules';
import { useAutomationVariableList } from '../context/AutomationVariableListContext';

/**
 * Builds everything an AutomationOutputVariableCard needs for one variable
 * key: display path, insert token, plus click & drag-start handlers carrying
 * the drag payload.
 */
export const useAutomationVariableCardProps = ({
  variableKey,
  label,
}: {
  variableKey: string;
  label: string;
}) => {
  const {
    buildVariablePath,
    buildVariablePayload,
    buildVariableToken,
    onInsertVariable,
  } = useAutomationVariableList();

  const path = buildVariablePath(variableKey);
  const token = buildVariableToken(variableKey);
  const payload = buildVariablePayload({
    key: variableKey,
    label,
    path,
    token,
  });

  return {
    title: label,
    path,
    token,
    onClick: onInsertVariable ? () => onInsertVariable(payload) : undefined,
    onDragStart: (event: React.DragEvent<HTMLDivElement>) => {
      setAutomationVariableDragData(event.dataTransfer, payload);
    },
  };
};

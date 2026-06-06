export const AUTOMATION_VARIABLE_DRAG_MIME =
  'application/x-erxes-automation-variable';

export type TAutomationVariableDragPayload = {
  token: string;
  path: string;
  label: string;
  key: string;
  sourceNodeId: string;
  sourceNodeType: string;
  sourceNodeLabel: string;
};

export const setAutomationVariableDragData = (
  dataTransfer: DataTransfer,
  payload: TAutomationVariableDragPayload,
) => {
  const serialized = JSON.stringify(payload);

  dataTransfer.effectAllowed = 'copy';
  dataTransfer.setData(AUTOMATION_VARIABLE_DRAG_MIME, serialized);
  dataTransfer.setData('text/plain', payload.token);
};

export const getAutomationVariableDragData = (
  dataTransfer: DataTransfer,
): TAutomationVariableDragPayload | null => {
  const serialized = dataTransfer.getData(AUTOMATION_VARIABLE_DRAG_MIME);

  if (!serialized) {
    return null;
  }

  try {
    return JSON.parse(serialized) as TAutomationVariableDragPayload;
  } catch {
    return null;
  }
};

export const insertAutomationVariableToken = ({
  value,
  token,
  selectionStart,
  selectionEnd,
}: {
  value: string;
  token: string;
  selectionStart?: number | null;
  selectionEnd?: number | null;
}) => {
  const start = selectionStart ?? value.length;
  const end = selectionEnd ?? start;

  const nextValue = `${value.slice(0, start)}${token}${value.slice(end)}`;
  const nextCursorPosition = start + token.length;

  return {
    nextValue,
    nextCursorPosition,
  };
};

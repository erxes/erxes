import { IBlockEditor } from 'erxes-ui';
import { TAutomationVariableDragPayload } from './automationVariableDragUtils';

export const insertAutomationVariableInBlockEditor = ({
  editor,
  payload,
}: {
  editor: IBlockEditor;
  payload: TAutomationVariableDragPayload;
}) => {
  editor.focus();
  editor.insertInlineContent([
    {
      type: 'attribute',
      props: {
        name: payload.path,
        value: payload.path,
      },
    },
    ' ',
  ]);
};

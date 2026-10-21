import type { ReactNode, Dispatch, SetStateAction, RefObject } from 'react';
import type { useDescriptionEditor } from '@/operation/hooks/useDescriptionEditor';
import type { ITaskDetail } from '@/task/types';

export type TaskDetailsProps = {
  taskId: string;
  checkTriage?: boolean;
  titleAction?: ReactNode;
};

export type TaskFieldsProps = {
  task: ITaskDetail;
  titleAction?: ReactNode;
};

export interface TaskFieldsEditorOptions {
  task: ITaskDetail;
  descriptionPlaceholder: string;
}
export interface TaskFieldsEditorState {
  name: ITaskDetail['name'];
  setName: Dispatch<SetStateAction<ITaskDetail['name']>>;
  editor: ReturnType<typeof useDescriptionEditor>['editor'];
  isDescriptionReady: boolean;
  textareaRef: RefObject<HTMLTextAreaElement>;
  handleDescriptionChange: () => void;
}

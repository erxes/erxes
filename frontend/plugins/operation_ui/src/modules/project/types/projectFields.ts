import type { ReactNode, Dispatch, SetStateAction } from 'react';
import type { useBlockEditor } from 'erxes-ui';
import type { useGetProject } from '@/project/hooks/useGetProject';
import type { IProjectDetail } from '@/project/types';

export type ProjectFieldsProps = {
  projectId: string;
  titleAction?: ReactNode;
};

export interface ProjectFieldsEditorOptions {
  projectId: string;
  descriptionPlaceholder: string;
}
export interface ProjectFieldsEditorState {
  project: ReturnType<typeof useGetProject>['project'];
  editor: ReturnType<typeof useBlockEditor>;
  name: IProjectDetail['name'] | undefined;
  setName: Dispatch<SetStateAction<IProjectDetail['name'] | undefined>>;
  localMemberIds: string[];
  setLocalMemberIds: Dispatch<SetStateAction<string[]>>;
  handleDescriptionChange: () => Promise<void>;
  handleIconChange: (icon: string | null) => void;
  handleTagsChange: (tagIds: string | string[]) => void;
}

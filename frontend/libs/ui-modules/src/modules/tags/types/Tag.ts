import { MutationHookOptions, OperationVariables } from '@apollo/client';

export interface ITag {
  _id: string;
  name: string;
  type?: string;
  colorCode?: string;
  createdAt?: string;
  cursor?: string;
  objectCount?: number;
  parentId?: string;
  isGroup?: boolean;
  order?: string;
  relatedIds?: string[];
  description?: string;
  hasChildren: boolean;
  totalObjectCount?: number;
}

export interface ITagQueryResponse {
  name: string;
  type?: string;
  isGroup: boolean;
  parentId?: string | null;
}

export type ISelectTagsProviderProps = {
  tagType: string;
  targetIds?: string[];
  value?: string[] | string;
  onValueChange?: (tags: string[] | string) => void;
  mode?: 'single' | 'multiple';
  children: React.ReactNode;
  options?: (newSelectedTagIds: string[]) => MutationHookOptions<
    {
      tags: {
        totalCount: number;
        list: ITag[];
      };
    },
    OperationVariables
  >;
};

export interface ISelectTagsContext {
  tagType: string;
  targetIds: string[];
  selectedTags: ITag[];
  value?: string[] | string;
  setSelectedTags: (tags: ITag[]) => void;
  onSelect: (tags: ITag) => void;
  newTagName: string;
  setNewTagName: (tagName: string) => void;
  mode: 'single' | 'multiple';
}

export interface SelectTagFetchMoreProps {
  fetchMore: () => void;
  tagsLength: number;
  totalCount: number;
}

export interface SelectTagsProps {
  tagType: string;
  selected?: string[];
  onSelect?: (tags: string[]) => void;
  loading?: boolean;
  recordId: string;
  fieldId?: string;
  showAddButton?: boolean;
  asTrigger?: boolean;
  display?: () => React.ReactNode;
  inDetail?: boolean;
}

export interface TagBadgesProps {
  tagIds?: string[];
  tags?: ITag[];
}

export interface ITagType {
  description: string;
  contentType: string;
}

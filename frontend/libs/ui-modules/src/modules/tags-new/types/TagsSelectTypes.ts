import { MutationHookOptions } from "@apollo/client";
import { GiveTagsMutationResponse, GiveTagsMutationVariables } from "ui-modules/modules/tags-new/types/TagMutationTypes";
import { ITag } from "ui-modules/modules/tags-new/types/Tag";
import { ReactNode } from "react"
type SingleTagsSelectProps = {
  mode: 'single';
  value?: string;
  onValueChange?: (value: string | undefined) => void;
};

type MultipleTagsSelectProps = {
  mode: 'multiple';
  value?: string[];
  onValueChange?: (value: string[]) => void;
};

export type TagsSelectProps = {
  type: string | null;
  children?: ReactNode;
  scope?: string;
  targetIds?: string[];
  options?: (
    newSelectedTagIds: string[],
  ) => MutationHookOptions<GiveTagsMutationResponse, GiveTagsMutationVariables>;
} & (SingleTagsSelectProps | MultipleTagsSelectProps);

export type TagsSelectContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedTags: ITag[];
  setSelectedTags: (tags: ITag[]) => void;
  tags?: ITag[];
  rootTags?: ITag[];
  tagsByParentId: Record<string, ITag[]>;
  handleChange: (tag: ITag) => void;
  mode: 'single' | 'multiple';
  value?: string | string[];
  onValueChange?: (value: string | string[] | undefined) => void;
  tagGroups: ITag[];
  type: string | null;
  loading: boolean;
  targetIds?: string[];
};

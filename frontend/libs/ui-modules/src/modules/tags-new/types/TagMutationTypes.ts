import { ITag } from "ui-modules/modules/tags-new/types/Tag";
export type GiveTagsMutationVariables = {
  type: string | null;
  targetIds: string[];
  tagIds: string[];
};

export type GiveTagsMutationResponse = {
  tagsTag: ITag | null;
};

export type AddTagMutationResponse = {
  tagsAdd: ITag;
};

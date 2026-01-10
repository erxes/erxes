import { ITag } from "ui-modules/modules/tags-new/types/Tag";
export type GiveTagsMutationVariables = {
  type: string | null;
  targetIds: string[];
  tagIds: string[];
};

export type GiveTagsMutationResponse = {
  tagsTag: null;
};

export type AddTagMutationResponse = {
  tagsAdd: ITag;
};

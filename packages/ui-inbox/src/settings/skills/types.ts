import { QueryResponse } from '@erxes/ui/src/types';

export interface ISkillType {
  name: string;
}

export interface ISkillTypesDocument extends ISkillType {
  _id: string;
}

export type SkillTypesQueryResponse = {
  skillTypes: ISkillTypesDocument[];
} & QueryResponse;

export interface ISkillDocument extends ISkill {
  _id: string;
}

export interface ISkill {
  name: string;
  typeId: string;
  memberIds: string[];
}

export type SkillsQueryResponse = {
  skills: ISkillDocument[];
  refetch: any;
  loading: boolean;
};

export type SkillsExcludeUserMutationResponse = {
  excludeUserSkill: (params: {
    _id: string;
    memberIds: string[];
  }) => Promise<void>;
};

import { QueryResponse } from 'modules/common/types';

export interface ISkillType {
  name: string;
}

export interface ISkillTypesDocument extends ISkillType {
  _id: string;
}

export type SkillTypesQueryResponse = {
  skillTypes: ISkillTypesDocument[];
} & QueryResponse;

export type SkillTypesTotalCountQueryResponse = {
  skillTypesTotalCunt: number;
  loading: boolean;
};

export type SkillTypesAddMutation = {
  createSkillType: (params: { variables: ISkillType }) => Promise<any>;
  loading: boolean;
};

export type SkillTypesEditMutation = {
  updateSkillType: (params: {
    variables: { _id: string } & ISkillType;
  }) => Promise<any>;
};

export type SkillTypesRemoveMutation = {
  removeSkillType: (params: { variables: { _id: string } }) => Promise<any>;
};

export interface ISkill {
  name: string;
  typeId: string;
  memberIds: string[];
}
export interface ISkillDocument extends ISkill {
  _id: string;
}

export type SkillsQueryResponse = {
  skills: ISkillDocument[];
  loading: boolean;
};

export type SkillsTotalCountQueryResponse = {
  skillsTotalCount: number;
  loading: boolean;
};

export type SkillsRemoveMutationResponse = {
  removeSkill: (params: { variables: { _id: string } }) => Promise<void>;
};

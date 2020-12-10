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

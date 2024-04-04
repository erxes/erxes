import { ISkillType } from '@erxes/ui-inbox/src/settings/skills/types';

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

export type SkillsTotalCountQueryResponse = {
  skillsTotalCount: number;
  loading: boolean;
};

export type SkillsRemoveMutationResponse = {
  removeSkill: (params: { variables: { _id: string } }) => Promise<void>;
};

export type SkillsUpdateMutationResponse = {
  updateSkill: (params: {
    variables: {
      _id: string;
      name?: string;
      typeId?: string;
      memberIds?: string[];
      exclude?: boolean;
    };
  }) => Promise<void>;
};

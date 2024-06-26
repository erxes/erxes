import { IUser } from '@erxes/ui/src/auth/types';

export interface ITemplateCategory {
    _id: string;
    name: string;
    parentId: string;
    code: string;
    contentType: string;

    templateCount: number;
    isRoot: boolean;

    createdAt?: Date
    createdBy?: IUser

    updatedAt?: Date
    updateBy?: IUser
}

export interface ITemplate {
    _id: string;
    name: string;
    description: string;
    contentType: string;
    content: string;

    categories: ITemplateCategory[]

    createdAt?: Date
    createdBy?: IUser

    updatedAt?: Date
    updateBy?: IUser
}

export type TemplateListQueryResponse = {
    templateList: {
        list: ITemplate[];
        totalCount: number;
    };
    refetch: () => void;
    loading: boolean;
};

export type TemplateCategoryListQueryResponse = {
    categoryList: {
        list: ITemplateCategory[];
        totalCount: number;
    };
}

export type TemplateAddMutationResponse = {
    templateAdd: (params: { variables: ITemplate }) => Promise<any>;
}

export type TemplateEditMutationResponse = {
    templateEdit: (params: { variables: ITemplate }) => Promise<any>;
}

export type TemplateRemoveMutationResponse = {
    templateRemove: (params: { variables: { _id: string } }) => Promise<any>;
}

export type TemplateUseMutationResponse = {
    templateUse: (params: { variables: ITemplate }) => Promise<any>;
}

export type TemplateCategoryAddMutationResponse = {
    categoryAdd: (params: { variables: ITemplateCategory }) => Promise<any>;
}

export type TemplateCategoryEditMutationResponse = {
    categoryEdit: (params: { variables: ITemplateCategory }) => Promise<any>;
}

export type TemplateCategoryRemoveMutationResponse = {
    categoryRemove: (params: { variables: { _id: string } }) => Promise<any>;
}

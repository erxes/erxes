import { IUser } from "../auth/types";

export interface ICompanyDoc {
    createdAt?: Date;
    modifiedAt?: Date;
    avatar: string;

    primaryName?: string;
    names?: string[];
    size?: number;
    industry?: string;
    website?: string;
    plan?: string;
    parentCompanyId?: string;
    email?: string;
    ownerId?: string;
    phone?: string;
    leadStatus?: string;
    lifecycleState?: string;
    businessType?: string;
    description?: string;
    employees?: number;
    doNotDisturb?: string;
    links?: {
        linkedIn?: string;
        twitter?: string;
        facebook?: string;
        github?: string;
        youtube?: string;
        website?: string;
    }
    tagIds?: string[];
    customFieldsData?: any;
};

export interface ICompany extends ICompanyDoc {
    _id?: string;
    owner: IUser;
    parentCompany: ICompany;
}
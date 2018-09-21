import { IUser } from "modules/auth/types";
import { IBrand } from "modules/settings/brands/types";

export interface IArticle {
    _id: string;
    title: string;
    summary: string;
    content: string;
    status: string;
    createdBy: string;
    createdUser: IUser;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
}

export interface ITopic {
    _id: string;
    title: string;
    description: string;
    categories: ICategory[];
    brand: IBrand;
    color: string;
    languageCode: string;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
}

export interface ICategory {
    _id: string;
    title: string;
    description: string;
    articles: IArticle[];
    icon: string;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
    firstTopic: ITopic;
}
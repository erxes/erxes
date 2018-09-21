import { IUser } from "modules/auth/types";

export interface IField {
    _id: string;
    contentType: string;
    contentTypeId?: string;
    type: string;
    validation: string;
    text: string;
    description: string;
    options: string[];
    isRequired?: boolean;
    order: React.ReactNode;
    isVisible?: boolean;
    isDefinedByErxes?: boolean;
    groupId: string;
    lastUpdatedUser?: IUser;
    lastUpdatedUserId?: string;
}

export interface IFieldGroup {
    _id: string;
    name: string;
    contentType: string;
    order: React.ReactNode;
    description: string;
    isVisible: boolean;
    isDefinedByErxes: boolean;
    fields: IField[];
    lastUpdatedUserId: string;
    lastUpdatedUser: IUser;
}

export interface IContentTypeFields {
    _id: string;
    name: string;
    label: string;
}

export interface IConfigColumn {
    name: string;
    label: string;
    order: React.ReactNode;
}
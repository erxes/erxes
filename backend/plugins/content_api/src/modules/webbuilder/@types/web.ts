import { Document } from 'mongoose';
import { ICommonFields } from '@/webbuilder/@types/common'; 
import { IAttachment } from 'erxes-api-shared/core-types';

export interface IAppearances{

    backgroundColor : string;
    primaryColor : string;
    secondaryColor: string ;
    accentColor: string;

    fontSans?: string ;
    fontHeading?: string ;
    fontMono?: string ;
}

export interface IWeb {
    name: string;
    description?: string;
    keywords? : string [];
    domain : string;
    copyright : string;
    
    thumbnail? : IAttachment;
    logo? : IAttachment;
    favicon?: IAttachment;

    appearances : IAppearances;

}

export interface IWebDocument extends ICommonFields, IWeb, Document{
    clientPortalId: string;
    _id: string;
}
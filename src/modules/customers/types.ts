import { IUser } from "../auth/types";
import { IIntegration } from "../settings/integrations/types";

export interface ICustomer {
    _id: string;
    firstName: string;
    lastName: string;
    phones?: string[];
    primaryPhone?: string;
    primaryEmail?: string;
    emails?: string[];
    isUser?: boolean;
    owner?: IUser;
    position?: string;
    location?: {
        userAgent?: string;
        country?: string;
        remoteAddress?: string;
        hostname?: string;
        language?: string;
    };
    department?: string;
    leadStatus?: string;
    lifecycleState?: string;
    hasAuthority?: boolean;
    description?: boolean;
    doNotDisturb?: boolean;
    links?: {
        facebook: string;
        twitter: string;
    }
    messengerData?: any
    visitorContactInfo?: any,
    getMessengerCustomData?: any
    integration: IIntegration
}
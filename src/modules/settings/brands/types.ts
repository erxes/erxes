export interface IBrand {
    _id: string;
    code: string;
    name?: string;
    createdAt: string;
    description?: string;
    emailConfig: { type: string; template: string; };
}

export interface IMessengerData {
    welcomeMessage: string,
    awayMessage: string,
    thankYouMessage: string,
    notifyCustomer: boolean,
    supporterIds: string[],
    availabilityMethod: string,
    isOnline: boolean,
    timezone: string,
    onlineHours: any,

}

export interface IUiOptions {
    color: string,
    wallpaper: string,
    logo: string,
}

export interface IIntegration {
    _id: string;
    kind: string;
    name?: string;
    brandId: string;
    description: string;
    code: string;
    formId: string;
    form: any;
    logo: string;
    languageCode: string;
    createUrl: string;
    createModal: string;
    messengerData: IMessengerData;
    uiOptions: IUiOptions;
}

export interface IBrandsCount {
    brandsTotalCount: number;
}
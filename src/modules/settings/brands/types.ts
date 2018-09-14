export interface IBrand {
    _id: string;
    code: string;
    name?: string;
    createdAt: string;
    description?: string;
    emailConfig: { type: string; template: string; };
}

export interface IBrandsCount {
    brandsTotalCount: number;
}
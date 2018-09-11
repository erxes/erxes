export interface IBrand {
    _id: string;
    code: string;
    name?: string;
    createdAt: string;
    description?: string;
}

export interface IIntegration {
    _id: string;
    kind: string;
    name?: string;
    brandId: string;
    code: string;
    formId: string;
}

export interface IBrandsCount {
    brandsTotalCount: number;
}
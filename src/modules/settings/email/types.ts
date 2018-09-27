export interface IEmailSignature {
    brandId?: string;
    signature?: string;
}

export interface IEmailSignatureWithBrand extends IEmailSignature {
    brandName?: string;
}
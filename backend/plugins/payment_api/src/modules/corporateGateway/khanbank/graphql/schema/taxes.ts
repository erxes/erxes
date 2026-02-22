export const types = `
type KhanbankTINResult {
    tin: String
    name: String
}

type KhanbankTaxAsset {
    objType: Int
    lockNo: String

    barrelNo: String
    regNumber: String
    chassisNo: String
    model: String
    mark: String
    certificateNo: String
}

type KhanbankTaxInquiryResult {
    invoiceNo: String
    amount: String
    taxPayerName: String
    description: String
    stateAccount: String
    stateAccountName: String
    invoiceType: String
    taxTypeCode: String
    taxTypeName: String
    branchCode: String
    branchName: String
    subBranchCode: String
    subBranchName: String
    year: String
    periodType: String
    period: String
    payfull: String
    payMore: String
    asset: KhanbankTaxAsset
}

enum InquiryParamType {
    byInvoiceNumber
    byCapitalNumber
}
`;

export const mutations = `
  khanbankTaxPay:String
`;

export const queries = `
  khanbankTaxGetCustomerTIN(customerRegistrationNumber: String!): KhanbankTINResult
  khanbankTaxInquiry(type: InquiryParamType!, value: String): [KhanbankTaxInquiryResult]
`;

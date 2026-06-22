export const accountConfigSchema = {
  // Үндсэн хөрөнгийн өртгийг бүртгэх данс
  fixedAssetAccountId: {
    type: String,
    optional: true,
    label: 'Fixed asset account',
  },
  // Хуримтлагдсан элэгдэл бүртгэх эсрэг данс
  accumulatedDepreciationAccountId: {
    type: String,
    optional: true,
    label: 'Accumulated depreciation account',
  },
  // Тухайн хугацааны элэгдлийн зардлыг бүртгэх данс
  depreciationExpenseAccountId: {
    type: String,
    optional: true,
    label: 'Depreciation expense account',
  },
  // Үндсэн хөрөнгө борлуулах, данснаас хасах үед үүсэх олзын данс
  gainAccountId: { type: String, optional: true, label: 'Gain account' },
  // Үндсэн хөрөнгө борлуулах, данснаас хасах үед үүсэх гарзын данс
  lossAccountId: { type: String, optional: true, label: 'Loss account' },
  // Дахин үнэлгээний өсөлт, бууралтыг бүртгэх нөөцийн данс
  revaluationReserveAccountId: {
    type: String,
    optional: true,
    label: 'Revaluation reserve account',
  },
  // Түр зөрүүнээс үүсэх deferred tax asset бүртгэх данс
  deferredTaxAssetAccountId: {
    type: String,
    optional: true,
    label: 'Deferred tax asset account',
  },
  // Түр зөрүүнээс үүсэх deferred tax liability бүртгэх данс
  deferredTaxLiabilityAccountId: {
    type: String,
    optional: true,
    label: 'Deferred tax liability account',
  },
  // Deferred tax journal-ийн income tax expense талын данс
  incomeTaxExpenseAccountId: {
    type: String,
    optional: true,
    label: 'Income tax expense account',
  },
};

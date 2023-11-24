export const KEY_LABELS = {
  brandId: 'brand',
  title: 'title',
  url: 'erkhet url',
  apiKey: 'api key',
  apiSecret: 'api secret',
  apiToken: 'api token',
  checkCompanyUrl: 'check Company url',
  costAccount: 'cost account',
  saleAccount: 'sale account',
  categoryCode: 'category Code',
  productCategoryCode: 'product Category Code',
  consumeDescription: 'consume products Description',
  customerDefaultName: 'customer Default Name',
  customerCategoryCode: 'customer Category Code',
  companyCategoryCode: 'company Category Code',
  debtAccounts: 'Debt accounts'
};

export const menuMultierkhet = [
  { title: 'Sync history', link: '/multi-erkhet-history' },
  {
    title: 'Check deals',
    link: '/check-many-synced-deals?dateType=firstOrMove'
  },
  { title: 'Check orders', link: '/check-many-pos-orders' },
  { title: 'Check Category', link: '/many-inventory-category' },
  { title: 'Check Products', link: '/many-inventory-products' }
];

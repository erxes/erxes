export enum TaxType {
  FREE = 'Free',
  SERVICE = '0 percent',
  INNER = 'Inner',
  CITYTAX = 'CityTax',
}
export enum TaxCode {
  TAXCODE1 = '0024-Жижиглэн худалдаалсан бүх төрлийн архи согтууруудах ундаа',
  TAXCODE2 = '0025-Жижиглэн худалдаагаар борлуулсан бүх төрлийн тамхи',
  TAXCODE3 = '6331000-Зочид буудлын үйлчилгээ',
  TAXCODE4 = '6313000-Амралтын газрын үйлчилгээ',
  TAXCODE5 = '6311110-Рестораны үйлчилгээ',
  TAXCODE6 = '6340000-Баарны үйлчилгээ',
  TAXCODE7 = '8534000-Автомашин угаалгын газар',
  TAXCODE8 = '8714-Авто үйлчилгээ үзүүлэгч',
}

export interface IProductRulesOnTax {
  _id?: string;
  title: string;
  productCategories: TaxType | string;
  taxType: string;
  excludeCategories: string;
  taxCode: TaxCode | string;
  products: string;
  excludeProducts: string;
  kind: string;
  percent: number;
  tags: string;
  excludeTags: string;
  status?: string;
}

export const productRulesOnTaxDefaultValues: IProductRulesOnTax = {
  title: '',
  productCategories: '',
  taxType: '',
  excludeCategories: '',
  taxCode: '',
  products: '',
  excludeProducts: '',
  kind: '',
  percent: 0,
  tags: '',
  excludeTags: '',
  status: '',
};

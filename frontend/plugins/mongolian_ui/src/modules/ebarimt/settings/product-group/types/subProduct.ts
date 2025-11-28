export interface ISubProduct {
  _id: string;
  name: string;
  code: string;
  type: string;
  status: string;
  barcodes: string[];
  categoryId: string;
  customFieldsDataByFieldCode: any;
  createdAt: string;
  tagIds: string[];
}

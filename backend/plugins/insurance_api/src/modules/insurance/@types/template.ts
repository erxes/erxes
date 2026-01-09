export interface ITemplate {
  name: string;
  insuranceType: string;
  description: string;
  product: string;
  vendor: string;
  htmlContent: string;
  cssContent: string;
  version: number;
  status: 'active' | 'inactive';
}

export interface ITemplateDocument extends ITemplate, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

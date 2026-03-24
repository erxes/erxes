export interface ITemplate {
  name: string;
  description?: string;
  htmlContent: string;
  cssContent?: string;
  version: number;
  status: 'draft' | 'active' | 'archived';
}

export interface ITemplateDocument extends ITemplate, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

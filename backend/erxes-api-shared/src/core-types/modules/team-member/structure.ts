
export interface IBrand {
  code?: string;
  name?: string;
  description?: string;
  userId?: string;
  emailConfig?: IBrandEmailConfig;
}

export interface IBrandDocument extends IBrand, Document {
  _id: string;
  emailConfig?: IBrandEmailConfigDocument;
  createdAt: Date;
}

export interface IBrandEmailConfig {
  type?: string;
  template?: string;
}

export interface IBrandEmailConfigDocument
  extends IBrandEmailConfig,
    Document {}

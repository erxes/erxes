export interface IGolomtBankConfig {
  name: string;
  description: string;
  consumerKey: string;
  secretKey: string;
}

export interface IGolomtBankConfigDocument extends IGolomtBankConfig, Document {
  _id: string;
  createdAt: Date;
}
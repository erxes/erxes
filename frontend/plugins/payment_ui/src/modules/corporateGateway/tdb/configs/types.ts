export interface ITdbConfig {
  _id: string;
  name: string;
  description?: string;
  apiUrl: string;
  clientId: string;
  clientSecret?: string;
  testMode?: boolean;
}

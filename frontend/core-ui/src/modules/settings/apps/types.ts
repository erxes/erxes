export interface IApp {
  _id: string;
  name: string;
  token: string;
  status: string;
  lastUsedAt?: string;
  createdAt: string;
}

export interface IAppData {
  apps: IApp[];
  appsTotalCount: number;
}

export interface IFetchEsArgs {
  subdomain: string;
  action: 'search' | 'count';
  index: string;
  body: any;
  _id?: string;
  defaultValue?: any;
  scroll?: string;
  size?: number;
  ignoreError?: boolean;
  connectionString?: string;
}

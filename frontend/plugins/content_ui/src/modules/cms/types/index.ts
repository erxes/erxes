export { IUser, ICategory, ITopic } from '../../shared/types';

export interface IWebsite {
  _id: string;
  clientPortalId?: string;
  name: string;
  description?: string;
  createdAt: string;
  domain?: string;
  publicUrl?: string;
  url?: string;
  kind?: string;
  languages?: string[];
  language?: string;
  postUrlField?: '_id' | 'count' | 'slug';
  postUrlPrefix?: string;
}

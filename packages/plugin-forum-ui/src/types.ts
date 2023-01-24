export interface ICategory {
  _id: string;
  type: string;
  name: string;
  order?: string;
  code: string;
  postsCount?: number;
  thumbnail?: string;
  ancestors?: any;
}

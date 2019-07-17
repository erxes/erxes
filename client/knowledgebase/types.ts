import { IUser } from "../types";

interface ICommonFields {
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
}

export interface IKbArticle extends ICommonFields {
  _id: string;
  title: string;
  summary: string;
  content: string;
  status: string;
  author: IUser;
}

export interface IKbCategory extends ICommonFields {
  _id: string;
  title: string;
  description: string;
  articleIds: string[];
  icon: string;

  authors: IUser[];
  articles: IKbArticle[];
  numOfArticles: number;
}

export interface IKbTopic extends ICommonFields {
  _id: string;
  title: string;
  description: string;
  brandId: string;
  categoryIds: string[];
  color: string;
  backgroundImage: string;
  languageCode?: string;

  categories: IKbCategory[];
}

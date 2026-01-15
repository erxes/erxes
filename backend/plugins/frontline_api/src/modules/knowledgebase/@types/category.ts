import { ICommonFields } from '@/knowledgebase/@types/common';
import { Document } from 'mongoose';


export interface ICategory {
    title?: string;
    description?: string;
    articleIds?: string[];
    icon?: string;
    parentCategoryId?: string;
    topicId?: string;
  }
  
  export interface ICategoryDocument extends ICommonFields, ICategory, Document {
    _id: string;
  }
  
import { IUser } from '../auth/types';
import { IField } from '../settings/properties/types';

interface IFormCommonFIelds {
  title?: string;
  description?: string;
  buttonText?: string;
  type?: string;
  numberOfPages?: number;
}
export interface IForm extends IFormCommonFIelds {
  _id: string;
  code?: string;
  createdUserId?: string;
  createdUser?: IUser;
  createdDate?: Date;
}

export interface IFormData extends IFormCommonFIelds {
  fields?: IField[];
}

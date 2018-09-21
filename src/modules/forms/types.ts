import { IUser } from "../auth/types";
import { IBrand } from "../settings/brands/types";
import { IIntegration } from "../settings/integrations/types";
import { ITag } from "../tags/types";

export interface ICallout {
  title?: string;
  body?: string;
  buttonText?: string;
  featuredImage?: string;
  skip?: boolean;
}

export interface IForm {
  _id: string;
  title?: string;
  code?: string;
  description?: string;
  buttonText?: string;
  themeColor?: string;
  callout?: ICallout;
  createdUserId?: string;
  createdUser?: IUser;
  createdDate?: Date;
  viewCount?: number;
  contactsGathered?: number;
  tagIds?: string[]
  getTags?: ITag[]
}

export interface IFormIntegration extends IIntegration {
  brand: IBrand;
  form: IForm;
  tags: ITag[];
  createdUser: IUser;
}
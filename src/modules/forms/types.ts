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

interface ISubmission extends Document {
  customerId: string;
  submittedAt: Date;
}

export interface IForm {
  title: string;
  code?: string;
  description?: string;
  buttonText?: string;
  themeColor?: string;
  callout?: ICallout;
  createdUserId: string;
  createdDate: Date;
  viewCount: number;
  contactsGathered: number;
  submissions: ISubmission[];
}

export interface IFormIntegration extends IIntegration {
  brand: IBrand;
  tags: ITag[];
}

import { IAttachment } from 'modules/common/types';

interface IAppearence {
  primaryColor: string;
  secondaryColor: string;
  bodyColor: string;
  headerColor: string;
  footerColor: string;
}
interface IFeature {
  _id: string;
  icon: string;
  name: string;
  description: string;
  contentType: string;
  contentId: string;
  subContentId: string;
}

export interface IExm {
  _id: string;
  name?: string;
  webName?: string;
  webDescription?: string;
  description?: string;
  features?: IFeature[];
  logo?: IAttachment;
  favicon?: IAttachment;
  url?: string;
  appearance?: IAppearence;
}

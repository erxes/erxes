import { IAttachment } from 'modules/common/types';

interface IAppearence {
  primaryColor: string;
  secondaryColor: string;
}

export interface IWelcomeContent {
  _id: string;
  title: string;
  image?: IAttachment;
  content: string;
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
  description?: string;
  features?: IFeature[];
  logo?: IAttachment;
  appearance?: IAppearence;
  welcomeContent?: IWelcomeContent[];
}

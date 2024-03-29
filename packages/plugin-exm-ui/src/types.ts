import { IAttachment } from '@erxes/ui/src/types';

interface IAppearence {
  primaryColor: string;
  secondaryColor: string;
  bodyColor: string;
  headerColor: string;
  footerColor: string;
}
interface IFeature {
  _id: string;
  name: string;
  description: string;
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
  vision?: string;
  structure?: string;
  appearance?: IAppearence;
  knowledgeBaseLabel?: string;
  knowledgeBaseTopicId?: string;
  ticketLabel?: string;
  ticketPipelineId?: string;
  ticketBoardId?: string;
}

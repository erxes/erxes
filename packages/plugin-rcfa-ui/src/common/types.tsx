import { IItem } from '@erxes/ui-cards/src/boards/types';

export type IRCFA = {
  _id: string;
  mainType: string;
  mainTypeId: string;
  mainTypeDetail?: IItem;
  relType: string;
  relTypeId: string;
  relTypeDetail?: IItem;
  status: string;
  createdAt: string;
  userId: string;
  closedAt: string;
};

export type IRCFAIssue = {
  _id: string;
  rcfaId: string;
  issue: string;
  createdAt: string;
  parentId: string;
  status: string;
  taskIds: string[];
  description: string;
  isRootCause: boolean;
};

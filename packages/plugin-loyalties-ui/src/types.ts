import { IAttachment } from '@erxes/ui/src/types';

export interface ICommonTypes {
  _id?: string;
  createdAt?: Date;
  createdBy?: string;
  modifiedAt?: Date;
  modifiedBy?: string;

  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  finishDateOfUse?: Date;
  attachment?: IAttachment;

  status?: string;
}

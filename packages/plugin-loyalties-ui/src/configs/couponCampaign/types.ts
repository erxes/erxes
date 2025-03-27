import { ICommonTypes } from '../../types';

export interface ICouponCampaign extends ICommonTypes {
  buyScore?: number;
  
  kind: 'amount' | 'percent';
  value: number;
  codeRule: IConfig;
  restrictions: any;
  redemptionLimitPerUser: number;
}

export type IConfig = {
  prefix?: string;
  postfix?: string;
  codeLength?: number;
  usageLimit?: number;
  size?: number;
  redemptionLimitPerUser?: number;
  staticCode?: string;
  charSet?: string[];
  pattern?: string;
};

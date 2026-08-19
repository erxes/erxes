import { HandleInvCost } from '../inventory/invCost';
import {
  HandleInvByPrice,
  HandleInvLineSummary,
  HandleInvProfit,
  HandleInvShipper,
} from '../inventory/invExtended';
import { HandleInvSale, HandleInvSaleCost } from '../inventory/invSale';
import { CalcReportHandler } from '../types';

export const inventoryCalcReportHandlers: Record<string, CalcReportHandler> = {
  invCost: HandleInvCost,
  invSale: HandleInvSale,
  invSaleCost: HandleInvSaleCost,
  invSaleCostPeriod: HandleInvSaleCost,
  invByPrice: HandleInvByPrice,
  invProfit: HandleInvProfit,
  invShipper: HandleInvShipper,
  invSaleDaily: HandleInvLineSummary,
  invSellerSubsys: HandleInvLineSummary,
};

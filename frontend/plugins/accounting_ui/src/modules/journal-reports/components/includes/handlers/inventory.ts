import { HandleInvCost } from '../inventory/invCost';
import {
  HandleInvByPrice,
  HandleInvLineSummary,
  HandleInvProfit,
  HandleInvShipper,
} from '../inventory/invExtended';
import { HandleInvSale, HandleInvSaleCost } from '../inventory/invSale';
import { HandleTransactionMore } from '../main/transactionMore';
import { CalcReportHandler, RenderMoreHandler } from '../types';

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

export const inventoryRenderMoreHandlers: Record<string, RenderMoreHandler> = {
  invCost: HandleTransactionMore,
  invSale: HandleTransactionMore,
  invSaleCost: HandleTransactionMore,
  invSaleCostPeriod: HandleTransactionMore,
  invByPrice: HandleTransactionMore,
  invProfit: HandleTransactionMore,
  invShipper: HandleTransactionMore,
  invSaleDaily: HandleTransactionMore,
  invSellerSubsys: HandleTransactionMore,
};

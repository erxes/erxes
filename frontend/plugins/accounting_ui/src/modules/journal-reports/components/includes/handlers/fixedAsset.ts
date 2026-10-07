import { HandleInvCost } from '../inventory/invCost';
import { HandleTransactionMore } from '../main/transactionMore';
import { CalcReportHandler, RenderMoreHandler } from '../types';

export const fixedAssetCalcReportHandlers: Record<string, CalcReportHandler> = {
  fxa: HandleInvCost,
};

export const fixedAssetRenderMoreHandlers: Record<string, RenderMoreHandler> = {
  fxa: HandleTransactionMore,
};

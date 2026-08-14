import { HandleInvCost } from '../inventory/invCost';
import { CalcReportHandler } from '../types';

export const fixedAssetCalcReportHandlers: Record<string, CalcReportHandler> = {
  fxa: HandleInvCost,
};

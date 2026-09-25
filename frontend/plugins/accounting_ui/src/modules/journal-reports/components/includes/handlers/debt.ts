import { HandleMainAC } from '../main/ac';
import { HandleMainACMore } from '../main/acMore';
import { CalcReportHandler, RenderMoreHandler } from '../types';

export const debtCalcReportHandlers: Record<string, CalcReportHandler> = {
  debt: HandleMainAC,
};

export const debtRenderMoreHandlers: Record<string, RenderMoreHandler> = {
  debt: HandleMainACMore,
};

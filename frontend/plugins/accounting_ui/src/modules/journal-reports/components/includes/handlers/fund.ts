import { HandleMainAC } from '../main/ac';
import { HandleMainACMore } from '../main/acMore';
import { CalcReportHandler, RenderMoreHandler } from '../types';

export const fundCalcReportHandlers: Record<string, CalcReportHandler> = {
  fund: HandleMainAC,
};

export const fundRenderMoreHandlers: Record<string, RenderMoreHandler> = {
  fund: HandleMainACMore,
};

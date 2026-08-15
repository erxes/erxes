import { HandleMainAC } from '../main/ac';
import { HandleMainACMore } from '../main/acMore';
import { HandleMainMJ, HandleMainMJS } from '../main/mj';
import { HandleMainTB } from '../main/tb';
import { CalcReportHandler, RenderMoreHandler } from '../types';

export const mainCalcReportHandlers: Record<string, CalcReportHandler> = {
  ac: HandleMainAC,
  tb: HandleMainTB,
  mb: HandleMainTB,
  mj: HandleMainMJ,
  mjs: HandleMainMJS,
};

export const mainRenderMoreHandlers: Record<string, RenderMoreHandler> = {
  ac: HandleMainACMore,
  tb: () => null,
};

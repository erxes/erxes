import { HandleMainTB } from '../main/tb';
import { CalcReportHandler } from '../types';

export const fundCalcReportHandlers: Record<string, CalcReportHandler> = {
  fund: HandleMainTB,
};

import { HandleMainTB } from '../main/tb';
import { CalcReportHandler } from '../types';

export const debtCalcReportHandlers: Record<string, CalcReportHandler> = {
  debt: HandleMainTB,
};

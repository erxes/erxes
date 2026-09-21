import { IGroupRule } from '~/modules/journal-reports/types/reportsMap';
import { CalcReportResult } from '..';
import { HandleBalanceReport } from './balance';

export const HandleMainTB = (
  dic: Record<string, unknown>,
  groupRule: IGroupRule,
  attr: string,
): CalcReportResult => HandleBalanceReport(dic, groupRule, attr);

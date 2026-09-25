import { IReportConfig, ReportGroups } from './common';
import { debtReportRules } from './debt';
import { fixedAssetReportRules } from './fixedAsset';
import { fundReportRules } from './fund';
import { inventoryReportRules } from './inventory';
import { mainReportRules } from './main';

export { ReportGroups } from './common';
export type { IGroupRule, IReportConfig } from './common';

export const ReportRules: Record<string, IReportConfig> = {
  ...mainReportRules,
  ...fundReportRules,
  ...debtReportRules,
  ...inventoryReportRules,
  ...fixedAssetReportRules,
};

export const ReportRuleGroups = [
  {
    ...ReportGroups[0],
    reportKeys: Object.keys(mainReportRules),
  },
  {
    ...ReportGroups[1],
    reportKeys: Object.keys(fundReportRules),
  },
  {
    ...ReportGroups[2],
    reportKeys: Object.keys(debtReportRules),
  },
  {
    ...ReportGroups[3],
    reportKeys: Object.keys(inventoryReportRules),
  },
  {
    ...ReportGroups[4],
    reportKeys: Object.keys(fixedAssetReportRules),
  },
].filter((group) => group.reportKeys.length);

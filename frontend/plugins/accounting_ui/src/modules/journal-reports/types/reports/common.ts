export const ReportGroups = [
  { key: 'main', label: 'general-journal' },
  { key: 'fund', label: 'cash-and-bank' },
  { key: 'debt', label: 'receivables-and-payables' },
  { key: 'inventory', label: 'inventory' },
  { key: 'fixedAsset', label: 'fixed-asset' },
];

export interface IGroupRule {
  group: string;
  code: string;
  name?: string;
  excMore?: boolean;
  from?: string[];
  excTotal?: number[];
  style?: string;
  groupRule?: IGroupRule | null;
}

export interface IReportConfig {
  title: string;
  icon?: string;
  colCount?: number;
  choices?: Array<{ code: string; title: string }>;
  initParams?: Record<string, string | boolean | number>;
  groups?: {
    [key: string]: IGroupRule;
  };
}

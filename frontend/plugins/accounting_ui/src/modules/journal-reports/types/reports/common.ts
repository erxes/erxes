export const ReportGroups = [
  { key: 'main', label: 'Ерөнхий журнал' },
  { key: 'fund', label: 'Мөнгөн хөрөнгө' },
  { key: 'debt', label: 'Авлага өглөг' },
  { key: 'inventory', label: 'Бараа материал' },
  { key: 'fixedAsset', label: 'Үндсэн хөрөнгө' },
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

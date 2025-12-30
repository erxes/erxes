export const ReportGroups = [
  { key: 'main', label: 'Ерөнхий журнал' },
  { key: 'fund', label: 'Мөнгөн хөрөнгө' },
  { key: 'debt', label: 'Авлага өглөг' },
  { key: 'inventory', label: 'Бараа материал' },
];

export interface IGroupRule {
  group: string;
  code: string;
  name?: string;
  style?: string;
  groupRule?: IGroupRule | null;
}

export interface IReportConfig {
  title: string;
  icon?: string;
  colCount?: number;
  choices?: Array<{ code: string; title: string }>;
  initParams?: Object;
  groups?: {
    [key: string]: IGroupRule;
  };
}

export const ReportRules: Record<string, IReportConfig> = {
  ac: {
    title: 'Дансны хуулга',
    colCount: 6,
    choices: [
      { code: 'default', title: 'Дансаар' },
      { code: 'cat', title: 'Дансны бүлгээр' },
    ],
    initParams: {
      isMore: true,
    },
    groups: {
      default: {
        key: 'gr',
        group: 'account_id',
        code: 'account__code',
        name: 'account__name',
        style: 'font-semibold bg-[#fefef1]',
        group_rule: null,
      },
      cat: {
        key: 'gr1',
        group: 'account__category_id',
        code: 'account__category__code',
        name: 'account__category__name',
        style: 'font-semibold',
        group_rule: {
          key: 'gr2',
          group: 'account_id',
          code: 'account__code',
          name: 'account__name',
          style: 'font-semibold bg-[#fefef1]',
          group_rule: null,
        },
      },
    },
  },
  tb: {
    title: 'Гүйлгээ баланс',
    colCount: 6,
    choices: [
      { code: 'default', title: 'Дансаар' },
      { code: 'cat', title: 'Дансны бүлгээр' },
    ],
    groups: {
      default: {
        key: 'gr',
        group: 'account_id',
        code: 'account__code',
        name: 'account__name',
        group_rule: null,
      },
      cat: {
        key: 'gr1',
        group: 'account__category_id',
        code: 'account__category__code',
        name: 'account__category__name',
        style: 'font-semibold',
        group_rule: {
          key: 'gr2',
          group: 'account_id',
          code: 'account__code',
          name: 'account__name',
          group_rule: null,
        },
      },
    },
  },
  mb: {
    title: 'Ерөнхий дэвтэр',
  },
  mj: {
    title: 'Ерөнхий журнал',
  },
};

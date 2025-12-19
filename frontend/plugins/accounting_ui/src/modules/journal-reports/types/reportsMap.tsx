export const ReportGroups = [
  { key: 'main', label: 'Ерөнхий журнал' },
  { key: 'fund', label: 'Мөнгөн хөрөнгө' },
  { key: 'debt', label: 'Авлага өглөг' },
  { key: 'inventory', label: 'Бараа материал' },
];

export interface IGroupRule {
  key: string;
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
  initParams?: Object,
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
      { code: 'cat', title: 'Дансны бүлгээр' }
    ],
    initParams: {
      isMore: true
    },
    groups: {
      default: {
        'key': 'gr',
        'group': 'accountId',
        'code': 'accountCode',
        'name': 'accountName',
        'style': 'font-semibold bg-[#fefef1]',
        'groupRule': null,
      },
      cat: {
        'key': 'gr1',
        'group': 'accountCategoryId',
        'code': 'accountCategoryCode',
        'name': 'accountCategoryName',
        'style': 'font-semibold',
        'groupRule': {
          'key': 'gr2',
          'group': 'accountId',
          'code': 'accountCode',
          'name': 'accountName',
          'style': 'font-semibold bg-[#fefef1]',
          'groupRule': null,
        },
      }
    }
  },
  tb: {
    title: 'Гүйлгээ баланс',
    colCount: 6,
    choices: [
      { code: 'default', title: 'Дансаар' },
      { code: 'cat', title: 'Дансны бүлгээр' }
    ],
    groups: {
      default: {
        'key': 'gr',
        'group': 'accountId',
        'code': 'accountCode',
        'name': 'accountName',
        'groupRule': null,
      },
      cat: {
        'key': 'gr1',
        'group': 'accountCategoryId',
        'code': 'accountCategoryCode',
        'name': 'accountCategoryName',
        'style': 'font-semibold',
        'groupRule': {
          'key': 'gr2',
          'group': 'accountId',
          'code': 'accountCode',
          'name': 'accountName',
          'groupRule': null
        }
      },
    }
  },
  mb: {
    title: 'Ерөнхий дэвтэр',
  },
  mj: {
    title: 'Ерөнхий журнал',
  }


}
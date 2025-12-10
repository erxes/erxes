export const ReportGroups = [
  { key: 'main', label: 'Ерөнхий журнал' },
  { key: 'fund', label: 'Мөнгөн хөрөнгө' },
  { key: 'debt', label: 'Авлага өглөг' },
  { key: 'inventory', label: 'Бараа материал' },
];

export const AllReportsMap = [
  { key: 'ac', title: 'Дансны хуулга', group: 'main', icon: 'IconClipboard' },
  { key: 'tb', title: 'Гүйлгээ баланс', group: 'main' },
  { key: 'mb', title: 'Ерөнхий дэвтэр', group: 'main' },
  { key: 'mj', title: 'Ерөнхий журнал', group: 'main' },
]

export interface IGroupRule {
  key: string;
  group: string;
  code: string;
  name?: string;
  format?: string;
  style?: string;
  group_rule?: IGroupRule | null;
}

interface ReportConfig {
  colCount: number;
  choices: Array<{ code: string; title: string }>;
  groups: {
    [key: string]: IGroupRule;
  };
}

export const GroupRules: Record<string, ReportConfig> = {
  tb: {
    colCount: 6,
    choices: [
      { code: 'default', title: 'Дансаар' },
      { code: 'cat', title: 'Дансны бүлгээр' },
    ],
    groups: {
      default: {
        'key': 'gr',
        'group': 'account_id',
        'code': 'account__code',
        'group_rule': null,
        'name': 'account__name',
      },
      cat: {
        'key': 'gr1',
        'group': 'account__category_id',
        'code': 'account__category__code',
        'name': 'account__category__name',
        'format': 'tr-bold',
        'group_rule': {
          'key': 'gr2',
          'group': 'account_id',
          'code': 'account__code',
          'name': 'account__name',
          'group_rule': null
        }
      }
    }
  }

}
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
  initParams?: any,
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
      { code: 'branchDepartment', title: 'Салбар хэлтсээр' },
      { code: 'departmentBranch', title: 'Хэлтэс салбараар' },
    ],
    initParams: {
      isMore: true
    },
    groups: {
      default: {
        group: 'accountId',
        code: 'accountCode',
        name: 'accountName',
        from: ['details'],
        style: 'font-semibold bg-[#fefef1]',
        groupRule: null,
      },
      cat: {
        group: 'accountCategoryId',
        code: 'accountCategoryCode',
        name: 'accountCategoryName',
        excMore: true,
        style: 'font-semibold',
        groupRule: {
          group: 'accountId',
          code: 'accountCode',
          name: 'accountName',
          from: ['details'],
          style: 'font-semibold bg-[#fefef1]',
          groupRule: null,
        },
      },
      branchDepartment: {
        group: 'branchId',
        code: 'branchCode',
        name: 'branchName',
        style: 'font-semibold',
        groupRule: {
          group: 'departmentId',
          code: 'departmentCode',
          name: 'departmentName',
          style: 'font-semibold',
          groupRule: {
            group: 'accountId',
            code: 'accountCode',
            name: 'accountName',
            from: ['details'],
            style: 'font-semibold bg-[#fefef1]',
            groupRule: null,
          },
        }
      },
      departmentBranch: {
        group: 'departmentId',
        code: 'departmentCode',
        name: 'departmentName',
        style: 'font-semibold',
        groupRule: {
          group: 'branchId',
          code: 'branchCode',
          name: 'branchName',
          style: 'font-semibold',
          groupRule: {
            group: 'accountId',
            code: 'accountCode',
            name: 'accountName',
            from: ['details'],
            style: 'font-semibold bg-[#fefef1]',
            groupRule: null,
          },
        }
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
        group: 'accountId',
        code: 'accountCode',
        name: 'accountName',
        groupRule: null,
      },
      cat: {
        group: 'accountCategoryId',
        code: 'accountCategoryCode',
        name: 'accountCategoryName',
        style: 'font-semibold',
        groupRule: {
          group: 'accountId',
          code: 'accountCode',
          name: 'accountName',
          groupRule: null
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
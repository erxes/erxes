import { ReportRules } from '../types/reportsMap';

export interface IReportHeaderCell {
  label: string;
  rowSpan?: number;
  colSpan?: number;
}

export type ReportHeaderRows = IReportHeaderCell[][];

const codeNameHeaderCells: IReportHeaderCell[] = [
  { label: 'Код' },
  { label: 'Нэр' },
];

const createSimpleHeaderRows = (
  valueLabels: string[],
  groupLabels: IReportHeaderCell[] = codeNameHeaderCells,
): ReportHeaderRows => [
  [...groupLabels, ...valueLabels.map((label) => ({ label }))],
];

const balanceHeaderRows: ReportHeaderRows = [
  [
    { label: 'Код', rowSpan: 2 },
    { label: 'Нэр', rowSpan: 2 },
    { label: 'Эхний үлдэгдэл', colSpan: 2 },
    { label: 'Гүйлгээ', colSpan: 2 },
    { label: 'Эцсийн үлдэгдэл', colSpan: 2 },
  ],
  [
    { label: 'Дебет' },
    { label: 'Кредит' },
    { label: 'Дебет' },
    { label: 'Кредит' },
    { label: 'Дебет' },
    { label: 'Кредит' },
  ],
];

const costHeaderRows: ReportHeaderRows = [
  [
    { label: 'Код', rowSpan: 2 },
    { label: 'Нэр', rowSpan: 2 },
    { label: 'Эхний үлдэгдэл', colSpan: 2 },
    { label: 'Орлого', colSpan: 2 },
    { label: 'Зарлага', colSpan: 2 },
    { label: 'Эцсийн үлдэгдэл', colSpan: 2 },
    { label: 'Нэгж өртөг', rowSpan: 2 },
  ],
  [
    { label: 'Тоо' },
    { label: 'Дүн' },
    { label: 'Тоо' },
    { label: 'Дүн' },
    { label: 'Тоо' },
    { label: 'Дүн' },
    { label: 'Тоо' },
    { label: 'Дүн' },
  ],
];

const inventoryPriceHeaderRows: ReportHeaderRows = [
  [
    { label: 'Код', rowSpan: 2 },
    { label: 'Нэр', rowSpan: 2 },
    { label: 'Нэгж үнэ', rowSpan: 2 },
    { label: 'Эхний үлдэгдэл', colSpan: 2 },
    { label: 'Орлого', colSpan: 2 },
    { label: 'Дотоод хөдөлгөөн', colSpan: 2 },
    { label: 'Бусад зарлага', colSpan: 2 },
    { label: 'Борлуулалт', colSpan: 4 },
    { label: 'Эцсийн үлдэгдэл', colSpan: 2 },
  ],
  [
    { label: 'Тоо' },
    { label: 'Дүн' },
    { label: 'Тоо' },
    { label: 'Дүн' },
    { label: 'Орлого' },
    { label: 'Зарлага' },
    { label: 'Тоо' },
    { label: 'Дүн' },
    { label: 'Тоо' },
    { label: 'Зарагдсан' },
    { label: 'Зарах' },
    { label: 'Хөнгөлөлт' },
    { label: 'Тоо' },
    { label: 'Дүн' },
  ],
];

const reportHeaderRowsByCode: Record<string, ReportHeaderRows> = {
  ac: balanceHeaderRows,
  tb: balanceHeaderRows,
  mb: balanceHeaderRows,
  fund: balanceHeaderRows,
  debt: balanceHeaderRows,
  mj: createSimpleHeaderRows(
    ['Дебет', 'Кредит'],
    [{ label: 'Огноо / Данс' }, { label: 'Утга / Дансны нэр' }],
  ),
  mjs: createSimpleHeaderRows(
    ['Гүйлгээний утга', 'Дебет данс', 'Кредит данс', 'Дүн', 'Зөрүү'],
    [{ label: 'Огноо' }, { label: 'Баримтын дугаар' }],
  ),
  invCost: costHeaderRows,
  fxa: costHeaderRows,
  invSale: createSimpleHeaderRows([
    'Тоо',
    'Нэгж үнэ',
    'Нийт борлуулалт',
    'НӨАТ-тай дүн',
  ]),
  invSaleCost: createSimpleHeaderRows([
    'Тоо',
    'Нэгж үнэ',
    'Нийт борлуулалт',
    'Нэгж өртөг',
    'Нийт өртөг',
    'Нийт ашиг',
  ]),
  invSaleCostPeriod: createSimpleHeaderRows([
    'Тоо',
    'Нэгж үнэ',
    'Нийт борлуулалт',
    'Нэгж өртөг',
    'Нийт өртөг',
    'Нийт ашиг',
  ]),
  invByPrice: inventoryPriceHeaderRows,
  invProfit: createSimpleHeaderRows([
    'Үлдэгдэл тоо',
    'Нэгж өртөг',
    'Нийт өртөг',
    'Нэгж үнэ',
    'Нийт үнэ',
    'Ашиг дүн',
  ]),
  invShipper: createSimpleHeaderRows([
    'Эхний тоо',
    'Эхний өртөг',
    'Орлого тоо',
    'Орлого өртөг',
    'Буцаалт тоо',
    'Буцаалт өртөг',
    'Бусад тоо',
    'Бусад өртөг',
    'Эцсийн тоо',
    'Эцсийн өртөг',
  ]),
  invSaleDaily: createSimpleHeaderRows([
    'Баримт',
    'Утга',
    'Харилцагч',
    'Тоо',
    'Дүн',
    'Дебет',
    'Кредит',
  ]),
  invSellerSubsys: createSimpleHeaderRows([
    'Баримт',
    'Утга',
    'Харилцагч',
    'Тоо',
    'Дүн',
    'Дебет',
    'Кредит',
  ]),
};

export const getReportHeaderRows = (report: string) =>
  reportHeaderRowsByCode[report] || [];

export const getReportColumnCount = (report: string) => {
  const valueColumnCount = ReportRules[report]?.colCount || 0;

  return valueColumnCount ? valueColumnCount + 2 : 0;
};

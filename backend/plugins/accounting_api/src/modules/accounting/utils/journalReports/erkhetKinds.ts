import { JOURNALS } from '../../@types/constants';

type TErkhetKindMap = Record<string, string[]>;

const unique = (values: string[]) => [...new Set(values.filter(Boolean))];

const normalizeKind = (kind: string | number) =>
  String(kind).replace('-', '').trim();

export const ERKHET_TR_KIND_JOURNALS: TErkhetKindMap = {
  '1': [JOURNALS.MAIN],
  '2': [JOURNALS.MAIN],
  '3': [JOURNALS.INV_FB],
  '4': [JOURNALS.INV_INCOME],
  '5': [JOURNALS.INV_MOVE, JOURNALS.INV_MOVE_IN],
  '6': [
    JOURNALS.INV_SALE_RETURN,
    JOURNALS.INV_SALE_RETURN_OUT,
    JOURNALS.INV_SALE_RETURN_COST,
  ],
  '8': [JOURNALS.INV_OUT],
  '9': [JOURNALS.BANK],
  '10': [JOURNALS.CASH],
  '11': [JOURNALS.EXCHANGE_DIFF],
  '12': [JOURNALS.RECEIVABLE, JOURNALS.PAYABLE],
  '13': [JOURNALS.FXA_INCOME],
  '14': [JOURNALS.FXA_INCOME],
  '15': [JOURNALS.FXA_OUT_DEPRECIATION],
  '16': [
    JOURNALS.FXA_OUT,
    JOURNALS.FXA_OUT_COST,
    JOURNALS.FXA_OUT_DEPRECIATION,
    JOURNALS.FXA_OUT_LOSS,
  ],
  '17': [JOURNALS.TAX],
  '18': [JOURNALS.MAIN],
  '20': [],
  '21': [JOURNALS.EXCHANGE_DIFF],
  '22': [JOURNALS.RECEIVABLE, JOURNALS.PAYABLE],
  '23': [JOURNALS.RECEIVABLE, JOURNALS.PAYABLE],
  '24': [JOURNALS.INV_SALE_COST],
  '25': [JOURNALS.INV_SALE],
  '26': [JOURNALS.INV_SALE, JOURNALS.INV_SALE_OUT, JOURNALS.INV_SALE_COST],
  '27': [JOURNALS.FXA_MOVE, JOURNALS.FXA_MOVE_IN],
  '28': [JOURNALS.INV_INCOME, JOURNALS.INV_OUT],
  '29': [JOURNALS.INV_SALE],
  '30': [JOURNALS.FXA_OUT, JOURNALS.FXA_OUT_DEPRECIATION],
};

export const ERKHET_REPORT_TR_KIND_GROUPS: TErkhetKindMap = {
  only_income: ERKHET_TR_KIND_JOURNALS['4'],
  only_csale: ERKHET_TR_KIND_JOURNALS['26'],
  only_sale: unique([
    ...ERKHET_TR_KIND_JOURNALS['29'],
    ...ERKHET_TR_KIND_JOURNALS['24'],
  ]),
  only_move: ERKHET_TR_KIND_JOURNALS['5'],
  only_so: ERKHET_TR_KIND_JOURNALS['8'],
  only_pos: ERKHET_TR_KIND_JOURNALS['25'],
  all_sale: unique([
    ...ERKHET_TR_KIND_JOURNALS['26'],
    ...ERKHET_TR_KIND_JOURNALS['29'],
    ...ERKHET_TR_KIND_JOURNALS['24'],
    ...ERKHET_TR_KIND_JOURNALS['25'],
  ]),
  all_sale_with_return: unique([
    ...ERKHET_TR_KIND_JOURNALS['26'],
    ...ERKHET_TR_KIND_JOURNALS['29'],
    ...ERKHET_TR_KIND_JOURNALS['24'],
    ...ERKHET_TR_KIND_JOURNALS['25'],
    ...ERKHET_TR_KIND_JOURNALS['6'],
  ]),
  exc_move: unique([
    ...ERKHET_TR_KIND_JOURNALS['3'],
    ...ERKHET_TR_KIND_JOURNALS['4'],
    ...ERKHET_TR_KIND_JOURNALS['8'],
    ...ERKHET_TR_KIND_JOURNALS['26'],
    ...ERKHET_TR_KIND_JOURNALS['29'],
    ...ERKHET_TR_KIND_JOURNALS['24'],
    ...ERKHET_TR_KIND_JOURNALS['25'],
    ...ERKHET_TR_KIND_JOURNALS['6'],
  ]),
  return: ERKHET_TR_KIND_JOURNALS['6'],
  only_adjust: ERKHET_TR_KIND_JOURNALS['28'],
};

export const resolveErkhetReportJournals = ({
  trKind,
  trKinds,
  getTrKind,
}: {
  trKind?: string;
  trKinds?: string[];
  getTrKind?: string;
}) => {
  const kinds = unique([trKind || '', ...(trKinds || [])]);
  const journals = unique(
    kinds.flatMap((kind) => ERKHET_TR_KIND_JOURNALS[normalizeKind(kind)] || []),
  );

  if (getTrKind && getTrKind !== 'all') {
    journals.push(...(ERKHET_REPORT_TR_KIND_GROUPS[getTrKind] || []));
  }

  return {
    hasFilter: !!kinds.length || (!!getTrKind && getTrKind !== 'all'),
    journals: unique(journals),
  };
};

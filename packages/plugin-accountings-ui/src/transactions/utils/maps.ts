import TrFormMain from "../components/trFormMain";
import TrFormCash from "../components/trFormCash";
import { ITransaction } from "../types";
import * as dayjs from 'dayjs';
import { ReactElement } from "react";

export const commonData = (journal, date?): ITransaction => {
  return {
    _id: journal,
    parentId: journal,
    number: 'auto/new',
    date,
    journal,
    details: [],
    sumDt: 0,
    sumCt: 0,
  }
}

export const journalConfigMaps: {
  [journal: string]: {
    component: React.ElementType;
    title: string;
    defaultData: (date?: Date, diff?: number) => any;
    generateDoc: () => any;

  }
} = {
  'main': {
    component: TrFormMain,
    title: '',
    defaultData: (date) => { return { ...commonData('main', date) } },
    generateDoc: () => { },
  },
  'cash': {
    component: TrFormCash,
    title: '',
    defaultData: (date) => { return { ...commonData('cash', date) } },
    generateDoc: () => { },
  }
}
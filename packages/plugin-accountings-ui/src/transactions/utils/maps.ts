import * as dayjs from 'dayjs';
import { TR_SIDES } from "../../constants";
import TrFormCash from "../components/TrFormCash";
import TrFormMain from "../components/TrFormMain";
import { ITransaction } from "../types";
import { getTempId } from "./utils";

export const commonData = (journal, date?): ITransaction => {
  return {
    _id: getTempId(),
    parentId: journal,
    number: 'auto/new',
    date,
    journal,
    details: [{
      side: TR_SIDES.DEBIT,
      amount: 0,
    }],
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
    defaultData: (date, diff) => {
      const data = { ...commonData('cash', date) };
      if ((diff || 0) > 0) {
        data.details[0].amount = diff;
        data.details[0].side = TR_SIDES.CREDIT;
      } else {
        data.details[0].amount = -1 * (diff || 0);
        data.details[0].side = TR_SIDES.DEBIT;
      }
      return data;
    },
    generateDoc: () => { },
  }
}
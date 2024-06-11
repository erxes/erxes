import TrFormMain from "../components/trFormMain";
import TrFormCash from "../components/trFormCash";
import { ITransaction } from "../types";
import * as dayjs from 'dayjs';

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

export const journalConfigMaps = {
  'main': { component: TrFormMain, title: '', defaultData: { ...commonData('main') }, generateDoc: () => { }, },
  'cash': { component: TrFormCash, title: '', defaultData: { ...commonData('cash') }, generateDoc: () => { }, }
}
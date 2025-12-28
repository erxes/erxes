import { displayNum, ReportTable } from "erxes-ui";
import { IGroupRule } from "~/modules/journal-reports/types/reportsMap";
import { AccountKind } from "~/modules/settings/account/types/Account";
import { TR_SIDES } from "~/modules/transactions/types/constants";
import { CalcReportResult } from "..";

export const HandleMainAC = (dic: any, groupRule: IGroupRule, attr: string): CalcReportResult => {
  const { items } = dic;
  let [fr_diff, tr_dt, tr_ct, lr_diff] = [0, 0, 0, 0];
  let rem = 0;

  for (const rec of items) {
    let multiplier = rec['account__kind'] === AccountKind.ACTIVE ? 1 : -1;
    multiplier = multiplier * (rec.side === TR_SIDES.DEBIT ? 1 : -1);

    if (rec.isBetween) {
      rem += multiplier * (rec.sumAmount);
      if (rec.side === TR_SIDES.DEBIT) {
        tr_dt += rec.sumAmount;
        lr_diff += rec.sumAmount;
      } else {
        tr_ct += rec.sumAmount;
        lr_diff -= rec.sumAmount;
      }



    } else {
      if (rec.side === TR_SIDES.DEBIT) {
        fr_diff += rec.sumAmount;
        lr_diff += rec.sumAmount;
      } else {
        fr_diff -= rec.sumAmount;
        lr_diff -= rec.sumAmount;
      }
    }
  }

  return {
    lastNode: (
      <>
        <ReportTable.Cell>{displayNum(fr_diff > 0 ? fr_diff : 0)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(fr_diff < 0 ? -1 * fr_diff : 0)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(tr_dt)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(tr_ct)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(lr_diff > 0 ? lr_diff : 0)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(lr_diff < 0 ? -1 * lr_diff : 0)}</ReportTable.Cell>
      </>
    ),
    lastData: { fr_diff },
  }

}

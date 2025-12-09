import { displayNum, ReportTable } from "erxes-ui";
import { IGroupRule } from "~/modules/journal-reports/types/reportsMap";
import { TR_SIDES } from "~/modules/transactions/types/constants";

export const HandleMainTB = (dic: any, groupRule: IGroupRule, attr: string) => {
  const { items } = dic;
  let [fr_diff, tr_dt, tr_ct, lr_diff] = [0, 0, 0, 0];

  for (const rec of items) {
    if (rec.isBetween) {
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

  return (
    <>
      <ReportTable.Cell>{fr_diff > 0 && displayNum(fr_diff) || ''}</ReportTable.Cell>
      <ReportTable.Cell>{fr_diff < 0 && displayNum(-1 * fr_diff) || ''}</ReportTable.Cell>
      <ReportTable.Cell>{displayNum(tr_dt)}</ReportTable.Cell>
      <ReportTable.Cell>{displayNum(tr_ct)}</ReportTable.Cell>
      <ReportTable.Cell>{lr_diff > 0 && displayNum(lr_diff) || ''}</ReportTable.Cell>
      <ReportTable.Cell>{lr_diff < 0 && displayNum(-1 * lr_diff) || ''}</ReportTable.Cell>
    </>
  )
}
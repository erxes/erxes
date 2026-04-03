import { displayNum, ReportTable } from "erxes-ui";
import { IGroupRule } from "~/modules/journal-reports/types/reportsMap";
import { TR_SIDES } from "~/modules/transactions/types/constants";
import { CalcReportResult } from "..";

export const HandleMainTB = (dic: any, _groupRule: IGroupRule, _attr: string): CalcReportResult => {
  const { items } = dic;
  let [fr_diff, tr_dt, tr_ct, lr_diff] = [0, 0, 0, 0];

  for (const rec of items) {
    const [dtAmount, ctAmount] = rec.side === TR_SIDES.DEBIT ? [rec.sumAmount, 0] : [0, rec.sumAmount];
    const diffAmount = dtAmount - ctAmount;

    if (rec.isBetween) {
      tr_dt += dtAmount;
      tr_ct += ctAmount;
      lr_diff += diffAmount;
    } else {
      fr_diff += diffAmount;
      lr_diff += diffAmount;
    }
  }

  return {
    lastNode: (
      <>
        <ReportTable.Cell>{displayNum(Math.max(fr_diff, 0))}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(-1 * Math.min(fr_diff, 0))}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(tr_dt)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(tr_ct)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(Math.max(lr_diff, 0))}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(-1 * Math.min(lr_diff, 0))}</ReportTable.Cell>
      </>
    )
  }
}
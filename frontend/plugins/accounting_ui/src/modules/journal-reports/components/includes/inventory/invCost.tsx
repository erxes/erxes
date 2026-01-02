import { displayNum, fixNum, ReportTable } from "erxes-ui";
import { IGroupRule } from "~/modules/journal-reports/types/reportsMap";
import { TR_SIDES } from "~/modules/transactions/types/constants";
import { CalcReportResult } from "..";

export const HandleInvCost = (dic: any, _groupRule: IGroupRule, _attr: string): CalcReportResult => {
  const { items } = dic;
  let [fCount, fAmount, dtCount, dtAmount, ctCount, ctAmount, lCount, lAmount] = [0, 0, 0, 0, 0, 0, 0, 0];

  for (const rec of items) {
    const [dtAmountCur, ctAmountCur] = rec.side === TR_SIDES.DEBIT ? [rec.sumAmount, 0] : [0, rec.sumAmount];
    const [dtCountCur, ctCountCur] = rec.side === TR_SIDES.DEBIT ? [rec.sumCount, 0] : [0, rec.sumCount];
    const diffAmount = dtAmountCur - ctAmountCur;
    const diffCount = dtCountCur - ctCountCur;

    if (rec.isBetween) {
      dtCount += dtCountCur;
      ctCount += ctCountCur;
      dtAmount += dtAmountCur;
      ctAmount += ctAmountCur;
    } else {
      fCount += diffCount;
      fAmount += diffAmount;
    }
    lCount += diffCount;
    lAmount += diffAmount;
  }

  const unitCost = fixNum(lAmount / lCount);

  return {
    lastNode: (
      <>
        <ReportTable.Cell>{displayNum(fCount)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(fAmount)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(dtCount)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(dtAmount)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(ctCount)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(ctAmount)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(lCount)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(lAmount)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(unitCost)}</ReportTable.Cell>
      </>
    )
  }
}
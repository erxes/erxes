import { format } from 'date-fns';
import { cn, displayNum, ReportTable } from "erxes-ui";
import { TR_SIDES } from "~/modules/transactions/types/constants";

export const HandleMainACMore = ({ moreData, currentKey, nodeExtra }: { moreData: any[], currentKey: string, nodeExtra: any }) => {
  const { fr_diff = 0 } = nodeExtra;
  const rows: any[] = [];
  let rem = fr_diff;

  moreData.forEach(md => {
    const multiplier = md.details.side === TR_SIDES.DEBIT ? 1 : -1;
    rem += multiplier * md.details.amount;
    rows.push({
      ...md,
      remainder: rem
    })
  });

  return (
    <ReportTable.Row
      key={currentKey}
      className={cn('text-right')}
    >
      <ReportTable.Cell colSpan={8} className="p-0">
        <ReportTable>
          <ReportTable.Header>
            <ReportTable.Row>
              <ReportTable.Head>Огноо</ReportTable.Head>
              <ReportTable.Head>Дугаар</ReportTable.Head>
              <ReportTable.Head>Харилцагч</ReportTable.Head>
              <ReportTable.Head>Гүйлгээний утга</ReportTable.Head>
              <ReportTable.Head>Валют дүн</ReportTable.Head>
              <ReportTable.Head>Дебет</ReportTable.Head>
              <ReportTable.Head>Кредит</ReportTable.Head>
              <ReportTable.Head>Үлдэгдэл</ReportTable.Head>
              <ReportTable.Head>Харьцсан данс</ReportTable.Head>
            </ReportTable.Row>
          </ReportTable.Header>
          <ReportTable.Body>

            {rows.map((tr) => (
              <ReportTable.Row
                className={cn('')}
                key={tr._id}
              >
                <ReportTable.Cell className="text-left">
                  {format(new Date(tr.date), 'yyyy-MM-dd')}
                </ReportTable.Cell>
                <ReportTable.Cell className="text-left">
                  {tr.number}
                </ReportTable.Cell>
                <ReportTable.Cell className="text-left">
                  
                </ReportTable.Cell>
                <ReportTable.Cell className="text-left">
                  {tr.description}
                </ReportTable.Cell>
                <ReportTable.Cell
                  className={cn(`text-right`)}
                >
                  {displayNum(tr.details.currencyAmount)}
                </ReportTable.Cell>
                <ReportTable.Cell
                  className={cn(`text-right`)}
                >
                  {tr.details.side === TR_SIDES.DEBIT && displayNum(tr.details.amount)}
                </ReportTable.Cell>
                <ReportTable.Cell
                  className={cn(`text-right`)}
                >
                  {tr.details.side === TR_SIDES.CREDIT && displayNum(tr.details.amount)}
                </ReportTable.Cell>
                <ReportTable.Cell
                  className={cn(`text-right `)}
                >
                  {displayNum(tr.remainder ?? 0)}
                </ReportTable.Cell>
                <ReportTable.Cell
                  className={cn(`text-left `)}
                >
                  {tr.details.relAccounts ?? ''}
                </ReportTable.Cell>
              </ReportTable.Row>
            ))}
          </ReportTable.Body>
          <ReportTable.Footer>
          </ReportTable.Footer>
        </ReportTable>
      </ReportTable.Cell>
    </ReportTable.Row>

  )
}
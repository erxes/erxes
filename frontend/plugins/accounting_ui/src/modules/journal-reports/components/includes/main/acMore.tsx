import { cn, displayNum, ReportTable } from "erxes-ui";
import { IGroupRule } from "~/modules/journal-reports/types/reportsMap";
import { AccountKind } from "~/modules/settings/account/types/Account";
import { TR_SIDES } from "~/modules/transactions/types/constants";

export const HandleMainACMore = (parent: string, child: string) => {
  // moreData Context
  return (
    <ReportTable.Row
      key={'aaaaaa'}
      className={cn('text-right')}
    >
      <ReportTable.Cell colSpan={8} className="p-0">
        <ReportTable>
          <ReportTable.Header>

          </ReportTable.Header>
          <ReportTable.Body >
            <ReportTable.Row
              className={cn('')}
            >
              <ReportTable.Cell
                className={cn(`text-left `)}
              >
                {parent}
              </ReportTable.Cell>
              <ReportTable.Cell className="text-left">
                {child}
              </ReportTable.Cell>

              {Array.from({ length: 5 }).map((_, i) => (
                <ReportTable.Cell key={i} className="text-right" />
              ))}
            </ReportTable.Row>
            <ReportTable.Row
              className={cn('')}
            >
              <ReportTable.Cell
                className={cn(`text-left `)}
              >
                11
              </ReportTable.Cell>
              <ReportTable.Cell className="text-left">
                21
              </ReportTable.Cell>

              {Array.from({ length: 5 }).map((_, i) => (
                <ReportTable.Cell key={i} className="text-right" />
              ))}
            </ReportTable.Row>
            <ReportTable.Row
              className={cn('')}
            >
              <ReportTable.Cell
                className={cn(`text-left `)}
              >
                12
              </ReportTable.Cell>
              <ReportTable.Cell className="text-left">
                22
              </ReportTable.Cell>

              {Array.from({ length: 5 }).map((_, i) => (
                <ReportTable.Cell key={i} className="text-right" />
              ))}
            </ReportTable.Row>
          </ReportTable.Body>
          <ReportTable.Footer>
          </ReportTable.Footer>
        </ReportTable>
      </ReportTable.Cell>
    </ReportTable.Row>


    // <ReportTable.Cell colSpan={6} className="p-0">
    //   <table className='w-full overflow-hidden caption-bottom text-[1em]  border-0'>
    //     <tr className='hover:bg-muted/50 data-[state=selected]:bg-muted border transition-colors'>
    //       <td className='p-[0.3em] align-middle border text-[1em] whitespace-normal break-all'>1</td>
    //       <td className='p-[0.3em] align-middle border text-[1em] whitespace-normal break-all'>2</td>
    //       <td className='p-[0.3em] align-middle border text-[1em] whitespace-normal break-all'>3</td>
    //       <td className='p-[0.3em] align-middle border text-[1em] whitespace-normal break-all'>4</td>
    //     </tr>
    //     <tr className='hover:bg-muted/50 data-[state=selected]:bg-muted border transition-colors'>
    //       <td className='p-[0.3em] align-middle border text-[1em] whitespace-normal break-all'>10</td>
    //       <td className='p-[0.3em] align-middle border text-[1em] whitespace-normal break-all'>20</td>
    //       <td className='p-[0.3em] align-middle border text-[1em] whitespace-normal break-all'>30</td>
    //       <td className='p-[0.3em] align-middle border text-[1em] whitespace-normal break-all'>40</td>
    //     </tr>
    //   </table>
    // </ReportTable.Cell >
  )
}
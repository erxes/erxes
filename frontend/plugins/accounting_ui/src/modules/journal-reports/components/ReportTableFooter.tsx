import { ReportTable, useQueryState } from "erxes-ui"

export const ReportTableFooter = () => {
  const [report] = useQueryState('report');
  
  switch (report) {
    case 'tb':
      return (
        <ReportTable.Row data-value-sum>
          <ReportTable.Cell></ReportTable.Cell>
          <ReportTable.Cell className="text-right">НИЙТ ДҮН:</ReportTable.Cell>
          <ReportTable.Cell sum-1></ReportTable.Cell>
          <ReportTable.Cell sum-1></ReportTable.Cell>
          <ReportTable.Cell sum-1></ReportTable.Cell>
          <ReportTable.Cell sum-1></ReportTable.Cell>
          <ReportTable.Cell sum-1></ReportTable.Cell>
          <ReportTable.Cell sum-1></ReportTable.Cell>
        </ReportTable.Row>
      )
    default:
      return <></>
  }
}
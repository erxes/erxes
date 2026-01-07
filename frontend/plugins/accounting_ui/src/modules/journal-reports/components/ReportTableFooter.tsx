import { ReportTable, useQueryState } from "erxes-ui"

export const ReportTableFooter = () => {
  const [report] = useQueryState('report');

  switch (report) {
    case 'tb':
    case 'ac':
      return (
        <ReportTable.Row data-sum-key="footer" className="bg-muted/50">
          <ReportTable.Cell></ReportTable.Cell>
          <ReportTable.Cell className="text-right">НИЙТ ДҮН:</ReportTable.Cell>
          <ReportTable.Cell className="text-right"></ReportTable.Cell>
          <ReportTable.Cell className="text-right"></ReportTable.Cell>
          <ReportTable.Cell className="text-right"></ReportTable.Cell>
          <ReportTable.Cell className="text-right"></ReportTable.Cell>
          <ReportTable.Cell className="text-right"></ReportTable.Cell>
          <ReportTable.Cell className="text-right"></ReportTable.Cell>
        </ReportTable.Row>
      )

    case 'invCost':
      return (
        <ReportTable.Row data-sum-key="footer" className="bg-muted/50">
          <ReportTable.Cell></ReportTable.Cell>
          <ReportTable.Cell className="text-right">НИЙТ ДҮН:</ReportTable.Cell>
          <ReportTable.Cell className="text-right"></ReportTable.Cell>
          <ReportTable.Cell className="text-right"></ReportTable.Cell>
          <ReportTable.Cell className="text-right"></ReportTable.Cell>
          <ReportTable.Cell className="text-right"></ReportTable.Cell>
          <ReportTable.Cell className="text-right"></ReportTable.Cell>
          <ReportTable.Cell className="text-right"></ReportTable.Cell>
          <ReportTable.Cell className="text-right"></ReportTable.Cell>
          <ReportTable.Cell className="text-right"></ReportTable.Cell>
          <ReportTable.Cell className="text-right"></ReportTable.Cell>
        </ReportTable.Row>
      )
    default:
      return <></>
  }
}
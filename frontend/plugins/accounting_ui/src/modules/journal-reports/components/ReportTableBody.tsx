import { ReportTable } from "erxes-ui"

export const ReportTableBody = () => {
  return (
    <>
      {Array.from({ length: 100 }).map((_, index) => (
        <ReportTable.Row data-value="" key={index}>
          <ReportTable.Cell>{index + 1}</ReportTable.Cell>
          <ReportTable.Cell className="overflow-hidden text-ellipsis">
            Кассанд байгаа бэлэн мөнгө (төгрөг)
          </ReportTable.Cell>
          <ReportTable.Cell>545,451,961.59</ReportTable.Cell>
          <ReportTable.Cell>0</ReportTable.Cell>
          <ReportTable.Cell>0</ReportTable.Cell>
          <ReportTable.Cell>0</ReportTable.Cell>
          <ReportTable.Cell>545,451,961.59</ReportTable.Cell>
          <ReportTable.Cell>0</ReportTable.Cell>
        </ReportTable.Row>
      ))}
    </>
  )
}
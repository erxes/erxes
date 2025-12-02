import { ReportTable } from 'erxes-ui';

export const ReportContent = () => {
  return (
    <ReportTable>
      <ReportTable.Header>
        <ReportTable.Row>
          <ReportTable.Head rowSpan={2}>Код</ReportTable.Head>
          <ReportTable.Head rowSpan={2}>Нэр</ReportTable.Head>
          <ReportTable.Head colSpan={2}>Эхний үлдэгдэл</ReportTable.Head>
          <ReportTable.Head colSpan={2}>Гүйлгээ</ReportTable.Head>
          <ReportTable.Head colSpan={2}>Эцсийн үлдэгдэл</ReportTable.Head>
        </ReportTable.Row>
        <ReportTable.Row>
          <ReportTable.Head>Дебет</ReportTable.Head>
          <ReportTable.Head>Кредит</ReportTable.Head>
          <ReportTable.Head>Дебет</ReportTable.Head>
          <ReportTable.Head>Кредит</ReportTable.Head>
          <ReportTable.Head>Дебет</ReportTable.Head>
          <ReportTable.Head>Кредит</ReportTable.Head>
        </ReportTable.Row>
      </ReportTable.Header>
      <ReportTable.Body>
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
      </ReportTable.Body>

      <ReportTable.Footer>
        <ReportTable.Row>
          <ReportTable.Cell></ReportTable.Cell>
          <ReportTable.Cell className="text-right">НИЙТ ДҮН:</ReportTable.Cell>
          <ReportTable.Cell>1,026,567,988.52</ReportTable.Cell>
          <ReportTable.Cell>1,026,567,988.53</ReportTable.Cell>
          <ReportTable.Cell>34,520,389.77</ReportTable.Cell>
          <ReportTable.Cell>34,520,389.77</ReportTable.Cell>
          <ReportTable.Cell>1,011,588,393.92</ReportTable.Cell>
          <ReportTable.Cell>1,011,588,393.93</ReportTable.Cell>
        </ReportTable.Row>
      </ReportTable.Footer>
    </ReportTable>
  )
}



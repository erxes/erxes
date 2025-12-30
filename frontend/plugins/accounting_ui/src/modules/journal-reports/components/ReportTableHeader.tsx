import { ReportTable, useQueryState } from 'erxes-ui';

export const ReportTableHeader = () => {
  const [report] = useQueryState('report');

  switch (report) {
    case 'tb':
      return (
        <>
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
        </>
      );
    case 'ac':
      return (
        <ReportTable.Row>
          <ReportTable.Head>Огноо</ReportTable.Head>
          <ReportTable.Head>Харилцагч</ReportTable.Head>
          <ReportTable.Head>Гүйлгээний утга</ReportTable.Head>
          <ReportTable.Head>Валют дүн</ReportTable.Head>
          <ReportTable.Head>Дебет</ReportTable.Head>
          <ReportTable.Head>Кредит</ReportTable.Head>
          <ReportTable.Head>Үлдэгдэл</ReportTable.Head>
          <ReportTable.Head>Харьцсан данс</ReportTable.Head>
        </ReportTable.Row>
      );
    default:
      return <></>;
  }
};

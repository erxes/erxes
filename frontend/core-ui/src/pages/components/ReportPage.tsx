import { ReportTable, Separator } from 'erxes-ui';
import { ReportPageContainer } from 'erxes-ui';

export const ReportPage = () => {
  return (
    <ReportPageContainer>
      <h1 className="text-[2em] leading-tight font-bold text-center py-[1em]">
        Гүйлгээ баланс
      </h1>
      <div className="flex justify-between pb-[2em]">
        <div className="flex flex-col gap-1">
          <p className="font-bold">Нью Панда ХХК</p>
          <Separator className="print:bg-foreground bg-border" />
          <p>(Аж ахуй нэгж албан байгууллагын нэр)</p>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <p>2025/11/01 - 2025/11/30</p>
          <p>(төгрөгөөр)</p>
        </div>
      </div>
      <DemoContent />
      <div className="py-8 flex flex-col gap-4 pl-[30%]">
        <div>
          Тайлан гаргасан: ................................../help_s@erkhet.biz/
        </div>
        <div>
          Хянасан нягтлан бодогч: ................................../
          Б.Эрдэнэцэцэг /
        </div>
      </div>
    </ReportPageContainer>
  );
};

const DemoContent = () => (
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
);

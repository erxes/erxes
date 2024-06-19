import { CollapseContent, Table, __ } from "@erxes/ui/src";
import dayjs from "dayjs"
import { IBurenScoring } from "../types";
import React from "react";
type Props = {
  customerScore: IBurenScoring;
};

import { Box } from "@erxes/ui/src/components/step/style";

export default function DetailForm(props: Props) {
  const { customerScore } = props;

  const inquiries = customerScore?.restInquiryResponse?.inquiry || [];
  const loanclass =
    customerScore?.externalScoringResponse?.data?.detail?.creditSummary
      ?.loanClasses || {};
  const creditScore =
    customerScore?.externalScoringResponse?.data?.detail?.creditScore || {};
  const monthlyLoanRepayment =
    customerScore?.externalScoringResponse?.data?.detail?.creditSummary
      .monthlyLoanRepayment || {};
  const activeLoanInformation =
    customerScore?.externalScoringResponse?.data?.detail?.creditSummary
      .activeLoanInformation || {};
  const customer = customerScore?.restInquiryResponse?.customer || {};
  return (
    <>
      <CollapseContent title="Харилцагчийн мэдээлэл">
        <div className="row">
          <div className=" flex gap-4 ">
            <Box hasShadow={true}>
              <span>Оноо: {creditScore?.scoringResult}</span>
              <span>Эрсдлийн харьцаа: {creditScore?.badRatio}</span>
              <span>Магадлал : {creditScore?.odds}</span>
              <span>
                Сарын төлөлт: {monthlyLoanRepayment?.userMonthlyRepayment}
              </span>
              <span>
                Шугаман зээлийн хэмжээ: {monthlyLoanRepayment?.lineTotalBaseAmount}
              </span>
              <span>
                Шугаман зээлийн үлдэгдэл:{" "}
                {monthlyLoanRepayment?.lineTotalRemainAmount}
              </span>
              <span>
                Идэвхитэй зээлийн үлдэгдэл:{" "}
                {activeLoanInformation?.activeLoanTotalRemainAmount}
              </span>
            </Box>
          </div>
          <div className=" flex gap-4 ">
            <Box hasShadow={true} className="text-right">

              <span>Овог: {customer?.lastname}</span>
              <span>Нэр:{customer?.firstname}</span>
              <span>Хаяг : {customer?.address}</span>
              <span>Регистер: {customer?.registerno}</span>
              <span>Ургийн овог: {customer?.familyname}</span>
              <span>Улс: {customer?.nationality}</span>
            </Box>
          </div>
        </div>
      </CollapseContent>
      <CollapseContent title="Зээлийн мэдээлэл">
        <Table $striped={true} $condensed={true} $bordered={true}>
          <thead>
            <th></th>
            <th>{__("Хэвийн")}</th>
            <th>{__("Анхаарал хандуулах")}</th>
            <th>{__("Муу")}</th>
            <th>{__("Нийт")}</th>
          </thead>
          <tbody>
            <tr>
              <th>Идэвхитэй</th>
              <th>{loanclass?.outstanding?.normal}</th>
              <th>{loanclass?.outstanding?.overdue}</th>
              <th>{loanclass?.outstanding?.bad}</th>
              <th>{loanclass?.outstanding?.total}</th>
            </tr>
            <tr>
              <th>Хаагдсан</th>
              <th>{loanclass?.closed?.normal}</th>
              <th>{loanclass?.closed?.overdue}</th>
              <th>{loanclass?.closed?.bad}</th>
              <th>{loanclass?.closed?.total}</th>
            </tr>
            <tr>
              <th>Нийт</th>
              <th>{loanclass?.total?.normal}</th>
              <th>{loanclass?.total?.overdue}</th>
              <th>{loanclass?.total?.bad}</th>
              <th>{loanclass?.total?.total}</th>
            </tr>
          </tbody>
        </Table>
      </CollapseContent>
      <CollapseContent title="Зээлийн лавлага">
        <Table $striped={true} $condensed={true} $bordered={true}>
          <thead>
            <th>{__("Төрөл")}</th>
            <th>{__("Олгосон дүн")}</th>
            <th>{__("Үлдэгдэл")}</th>
            <th>{__("Валют")}</th>
            <th>{__("Байгууллага")}</th>
            <th>{__("Ангилал")}</th>
            <th>{__("Хамтран")}</th>
            <th>{__("Эхэлсэн өдөр")}</th>
            <th>{__("Дуусах өдөр")}</th>
            <th>{__("Төлсөн өдөр")}</th>
          </thead>
          <tbody>
            {inquiries.map((inquiry) => {
              return (
                <tr key={inquiry.ROWNUM}>
                  <th>{inquiry?.LOANTYPE}</th>
                  <th>{inquiry?.ADVAMOUNT}</th>
                  <th>{inquiry?.BALANCE}</th>
                  <th>{inquiry?.CURRENCYCODE}</th>
                  <th> {inquiry.ORGNAME}</th>
                  <th>{inquiry?.LOANCLASS}</th>
                  <th>{inquiry?.RELATION_TYPE}</th>
                  <th>{dayjs(inquiry.STARTEDDATE).format('YYYY-MM-DD')}</th>
                  <th>{dayjs(inquiry?.EXPDATE).format('YYYY-MM-DD')}</th>
                  <th> {dayjs(inquiry?.PAID_DATE).format('YYYY-MM-DD')}</th>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </CollapseContent>
    </>
  );
}

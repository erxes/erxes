import { CollapseContent, Table, __ } from "@erxes/ui/src";

import { IBurenScoring } from "../types";
import React, { useState } from "react";
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
      <CollapseContent title="Customer info">
        <div className="row">
          <div className=" flex gap-4 ">
            <Box hasShadow={true}>
              <span>score: {creditScore?.scoringResult}</span>
              <span>badRatio: {creditScore?.badRatio}</span>
              <span>odds : {creditScore?.odds}</span>
              <span>
                Monthly Repayment: {monthlyLoanRepayment?.userMonthlyRepayment}
              </span>
              <span>
                line Base Amount: {monthlyLoanRepayment?.lineTotalBaseAmount}
              </span>
              <span>
                line Remain Amount:{" "}
                {monthlyLoanRepayment?.lineTotalRemainAmount}
              </span>
              <span>
                Active Remain Amount:{" "}
                {activeLoanInformation?.activeLoanTotalRemainAmount}
              </span>
            </Box>
          </div>
          <div className=" flex gap-4 ">
            <Box hasShadow={true} className="text-right">
              <span>firstname:{customer?.firstname}</span>
              <span>lastname: {customer?.lastname}</span>
              <span>address : {customer?.address}</span>
              <span>registerno: {customer?.registerno}</span>
              <span>familyname: {customer?.familyname}</span>
              <span>nationality: {customer?.nationality}</span>
            </Box>
          </div>
        </div>
      </CollapseContent>
      <CollapseContent title="Loan's class">
        <Table $striped={true} $condensed={true} $bordered={true}>
          <thead>
            <th></th>
            <th>{__("normal")}</th>
            <th>{__("overdue")}</th>
            <th>{__("bad")}</th>
            <th>{__("total")}</th>
          </thead>
          <tbody>
            <tr>
              <th>out standing</th>
              <th>{loanclass?.outstanding?.normal}</th>
              <th>{loanclass?.outstanding?.overdue}</th>
              <th>{loanclass?.outstanding?.bad}</th>
              <th>{loanclass?.outstanding?.total}</th>
            </tr>
            <tr>
              <th>closed</th>
              <th>{loanclass?.closed?.normal}</th>
              <th>{loanclass?.closed?.overdue}</th>
              <th>{loanclass?.closed?.bad}</th>
              <th>{loanclass?.closed?.total}</th>
            </tr>
            <tr>
              <th>total</th>
              <th>{loanclass?.total?.normal}</th>
              <th>{loanclass?.total?.overdue}</th>
              <th>{loanclass?.total?.bad}</th>
              <th>{loanclass?.total?.total}</th>
            </tr>
          </tbody>
        </Table>
      </CollapseContent>
      <CollapseContent title="Loan's inquiry">
        <Table $striped={true} $condensed={true} $bordered={true}>
          <thead>
            <th>{__("loan type")}</th>
            <th>{__("avarge amount")}</th>
            <th>{__("balance")}</th>
            <th>{__("currency code")}</th>
            <th>{__("org name")}</th>
            <th>{__("loan class")}</th>
            <th>{__("relation type")}</th>
            <th>{__("started date")}</th>
            <th>{__("exp date")}</th>
            <th>{__("paid date")}</th>
          </thead>
          <tbody>
            {inquiries.map((inquiry) => {
              return (
                <tr>
                  <th>{inquiry?.LOANTYPE}</th>
                  <th>{inquiry?.ADVAMOUNT}</th>
                  <th>{inquiry?.BALANCE}</th>
                  <th>{inquiry?.CURRENCYCODE}</th>
                  <th> {inquiry.ORGNAME}</th>
                  <th>{inquiry?.LOANCLASS}</th>
                  <th>{inquiry?.RELATION_TYPE}</th>
                  <th>{inquiry.STARTEDDATE}</th>
                  <th>{inquiry?.EXPDATE}</th>
                  <th> {inquiry?.PAID_DATE}</th>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </CollapseContent>
    </>
  );
}

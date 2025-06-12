import React from "react";
import { gql, useQuery } from "@apollo/client";
import query from "../graphql/queries";
import { IContract } from "../types";
import { FieldStyle, SidebarCounter, SidebarList } from "@erxes/ui/src";

interface IProps {
  contract: IContract;
}

function SavingInfo(props: IProps) {
  const { contract } = props;

  const { data } = useQuery<any>(gql(query.getPolarisData), {
    variables: {
      method: contract.isDeposit ? "getDepositDetail" : "getSavingDetail",
      data: { number: contract.number }
    }
  });

  const renderRow = (label, value) => {
    if (!value) return <></>;
    return (
      <li>
        <FieldStyle>{`${label}`}</FieldStyle>
        <SidebarCounter>{data?.getPolarisData?.[value] || "-"}</SidebarCounter>
      </li>
    );
  };

  return (
    <SidebarList className="no-link">
      {renderRow("Saving Number", "acntCode")}
      {renderRow("Actual balance", "availBal")}
      {renderRow("Potential balance", "currentBal")}
      {renderRow("Product Name", "prodName")}
      {renderRow("Customer Name", "custName")}
      {renderRow(
        "Open Date",
        data?.getPolarisData?.openDateOrg ? "openDateOrg" : "openDate"
      )}
      {renderRow("Maturity Date", "maturityDate")}
    </SidebarList>
  );
}

export default SavingInfo;

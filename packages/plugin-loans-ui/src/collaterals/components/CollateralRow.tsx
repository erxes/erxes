import _ from "lodash";
import { formatValue } from "@erxes/ui/src";
import React from "react";
import { ICollateral } from "../types";
import { useNavigate } from "react-router-dom";

type Props = {
  collateral: ICollateral;
};

function displayValue(collateral, name) {
  const value = _.get(collateral, name);

  return formatValue(value);
}

function displayNumber(collateral, name) {
  const value = _.get(collateral, name);

  return (value || 0).toLocaleString();
}

function CollateralRow({ collateral }: Props) {
  const navigate = useNavigate();

  const onClick = (e) => {
    e.stopPropagation();
  };

  const onTrClick = (e) => {
    navigate(`/erxes-plugin-loan/contract-details/${collateral.contractId}`);
  };

  return (
    <tr onClick={onTrClick}>
      <td key={"code"}>{displayValue(collateral.product, "code")} </td>
      <td key={"name"}>{displayValue(collateral.product, "name")}</td>
      <td key={"certificate"}>
        {displayValue(collateral.collateralData, "certificate")}
      </td>
      <td key={"vinNumber"}>
        {displayValue(collateral.collateralData, "vinNumber")}
      </td>
      <td key={"cost"}>{displayNumber(collateral.collateralData, "cost")}</td>
      <td key={"marginAmount"}>{displayNumber(collateral, "marginAmount")}</td>
      <td key={"leaseAmount"}>
        {displayNumber(collateral.collateralData, "leaseAmount")}
      </td>
    </tr>
  );
}

export default CollateralRow;

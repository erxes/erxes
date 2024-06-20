import { ChargeUsage } from "../types";
import Label from "modules/common/components/Label";
import React from "react";
import { __ } from "@erxes/ui/src/utils";
import { formatNumber } from "../utils";

type Props = {
  name: string;
  bottomSpace?: number;
  showCompact?: boolean;
  children?: React.ReactNode;
  isBold?: boolean;
  unit?: string;
  comingSoon?: boolean;
  usage: ChargeUsage;
  unLimited?: boolean;
};

function ChargeItem(props: Props) {
  const { name, children, unit, usage, unLimited } = props;

  const {
    totalAmount,
    remainingAmount,
    usedAmount,
    freeAmount,
    // promoCodeAmount,
    purchasedAmount,
  } = usage;

  return (
    <tr>
      <td>
        {__(name)} &nbsp;
        {children}
      </td>
      <td>
        <Label lblStyle="danger" ignoreTrans={true}>
          {!unLimited ? (
            `${formatNumber(usedAmount)} ${unit || ""}`
          ) : (
            <span>&infin;</span>
          )}
        </Label>
      </td>
      <td>
        <Label lblStyle="success" ignoreTrans={true}>
          {!unLimited ? (
            `${formatNumber(remainingAmount)} ${unit || ""}`
          ) : (
            <span>&infin;</span>
          )}
        </Label>
      </td>
      <td>
        {" "}
        {!unLimited ? (
          `${formatNumber(freeAmount)} ${unit || ""}`
        ) : freeAmount > 0 ? (
          <span> &#10003;</span>
        ) : (
          "-"
        )}
      </td>
      {/* <td>
        {!unLimited ? `${formatNumber(promoCodeAmount)} ${unit || ""}` : "-"}
      </td> */}
      <td>
        {!unLimited ? (
          `${formatNumber(purchasedAmount)} ${unit || ""}`
        ) : purchasedAmount > 0 ? (
          <span> &#10003;</span>
        ) : (
          "-"
        )}
      </td>
      <td className="odd">
        {!unLimited ? (
          `${formatNumber(totalAmount)} ${unit || ""}`
        ) : (
          <span>&infin;</span>
        )}
      </td>
    </tr>
  );
}

export default ChargeItem;

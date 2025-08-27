import { Box, FieldStyle, SidebarCounter, SidebarList } from "@erxes/ui/src";
import { __ } from "coreui/utils";
import React from "react";

import Icon from "@erxes/ui/src/components/Icon";
import confirm from "@erxes/ui/src/utils/confirmation/confirm";
import Alert from "@erxes/ui/src/utils/Alert";
import { IContractDoc } from "../../types";

type Props = {
  contract: IContractDoc;
  sentTransaction: (data: any) => void;
  closeData: any;
};

function Transaction({ contract, sentTransaction, closeData }: Props) {
  const sentCloseData = {
    total: closeData?.getPolarisData?.totalBal,
    currency: "MNT",
    contractId: contract?._id
  };

  console.log(
    closeData?.getPolarisData?.totalBal,
    "closeData?.getPolarisData?.totalBal"
  );

  // 48835.34

  const onHandlePolaris = () =>
    confirm(__("Are you sure you want to send transactions?"))
      .then(() => {
        sentTransaction(sentCloseData);
      })
      .catch((error) => {
        Alert.error(error.message);
      });

  const renderExtraButton = () => {
    return (
      <button onClick={onHandlePolaris} title="send transaction">
        <Icon icon="refresh-1" />
      </button>
    );
  };

  const renderRow = (label, value) => {
    if (!value) return <></>;
    return (
      <li>
        <FieldStyle>{`${label}`}</FieldStyle>
        <SidebarCounter>
          {closeData?.getPolarisData?.[value] || "-"}
        </SidebarCounter>
      </li>
    );
  };

  return (
    <Box
      title={__("Transaction history")}
      name="showPolaris"
      isOpen={true}
      extraButtons={renderExtraButton()}
    >
      <SidebarList className="no-link">
        {renderRow("Lease Amount", "princBal")}
        {renderRow("Close Amount", "totalBal")}
      </SidebarList>
    </Box>
  );
}

export default Transaction;

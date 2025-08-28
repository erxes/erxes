import React from "react";
import { __ } from "coreui/utils";
import { IContract } from "../../types";
import TransactionContainer from "../../containers/Transaction";
import TransactionHistories from "../../containers/TransactionHistories";
import { Tabs } from "..";
import CloseLoanInfo from "../../containers/CloseLoanInfo";

interface IProps {
  contract: IContract;
  savingHistories: any[];
}

function PolarisData(props: IProps) {
  return (
    <Tabs
      tabs={[
        {
          label: __(`Transaction`),
          component: <TransactionContainer {...props} />
        },
        {
          label: __(`Sync Histories`),
          component: <TransactionHistories {...props} />
        },
        {
          label: __(`Loan Close`),
          component: <CloseLoanInfo {...props} />
        }
      ]}
    />
  );
}

export default PolarisData;

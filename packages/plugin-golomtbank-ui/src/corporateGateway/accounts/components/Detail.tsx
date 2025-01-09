import Button from "@erxes/ui/src/components/Button";
import FormGroup from "@erxes/ui/src/components/form/Group";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import { __ } from "@erxes/ui/src/utils/core";
import React from "react";

import { BlockRow } from "../../../styles";
import { getCurrencySymbol } from "../../../utils";
import {
  IGolomtBankAccountBalance,
  IGolomtBankAccountDetail
} from "../../../types/IGolomtAccount";
import TransactionForm from "../../transactions/containers/Form";
import Transactions from "../../transactions/containers/List";
type Props = {
  queryParams: any;
  account: IGolomtBankAccountDetail;
  balances?: IGolomtBankAccountBalance;
  accountId?: string;
};

const Detail = (props: Props) => {
  const { account, balances, queryParams } = props;

  const getStatusValue = value => {
    switch (value) {
      case "A":
        return "active";
      case "I":
        return "inactive";
      case "D":
        return "dormant";
      default:
        return "";
    }
  };
  const isRel = value => {
    switch (value) {
      case "N":
        return "NO";
      case "Y":
        return "YES";
      default:
        return "";
    }
  };
  const transactionTrigger = (
    <Button btnStyle="simple" size="small" icon="money-insert">
      {__("Transfer")}
    </Button>
  );

  const transactionFormContent = modalProps => (
    <TransactionForm
      {...modalProps}
      configId={queryParams._id}
      accountNumber={queryParams.account}
      accountName={account.accountName}
    />
  );
  const renderAccount = () => {
    return (
      <div>
        <h4>{__("Account detail")}</h4>
        <BlockRow>
          <FormGroup>
            <p>{__("Account")}</p>
            <strong>{account.accountNumber}</strong>
          </FormGroup>

          <FormGroup>
            <p>{__("Account name")} </p>
            <strong>{account.accountName}</strong>
          </FormGroup>

          <FormGroup>
            <p>{__("Customer name")} </p>
            <strong>{account.customerName}</strong>
          </FormGroup>
        </BlockRow>

        <BlockRow>
          <FormGroup>
            <p>{__("Balance")} </p>
            {(balances?.balanceLL || []).map(balance => (
              <strong key={balance.amount.toString()}>
                {balance.amount.value.toLocaleString()}
                {getCurrencySymbol(balance.amount.currency || "MNT")}
              </strong>
            ))}
          </FormGroup>
          <FormGroup>
            <p>{__("product name")} </p>
            <strong>{account.productName}</strong>
          </FormGroup>
          <FormGroup>
            <p>{__("branch")} </p>
            <strong>{account.branchId}</strong>
          </FormGroup>
        </BlockRow>
        <BlockRow>
          <FormGroup>
            <p>{__("status")}</p>
            <strong>{getStatusValue(account.status)}</strong>
          </FormGroup>
          <FormGroup>
            <p>{__("registration")}</p>
            <strong>{isRel(account.isRelParty)}</strong>
          </FormGroup>
          <FormGroup>
            <p>{__("open date")}</p>
            <strong>{account.openDate}</strong>
          </FormGroup>
        </BlockRow>
        <BlockRow>
          <FormGroup>
            <ModalTrigger
              size="lg"
              title={__("Transfer")}
              autoOpenKey="showAppAddModal"
              trigger={transactionTrigger}
              content={transactionFormContent}
            />
          </FormGroup>
        </BlockRow>
      </div>
    );
  };

  const renderStatements = () => {
    return (
      <div>
        <h4>{__("Latest transactions")}</h4>
        <Transactions {...props} showLatest={true} />
      </div>
    );
  };

  return (
    <>
      {renderAccount()}
      {renderStatements()}
    </>
  );
};

export default Detail;

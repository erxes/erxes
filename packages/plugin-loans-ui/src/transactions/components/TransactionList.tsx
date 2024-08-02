import {
  Alert,
  BarItems,
  Button,
  DataWithLoader,
  DropdownToggle,
  FormControl,
  Icon,
  Pagination,
  SortHandler,
  Table,
  Wrapper,
  confirm
} from "@erxes/ui/src";
import { ORGANIZATION_TYPE, menuContracts } from "../../constants";

import { ContractsTableWrapper } from "../../contracts/styles";
import Dropdown from "@erxes/ui/src/components/Dropdown";
import { ITransaction } from "../types";
import { IUser } from "@erxes/ui/src/auth/types";
import InterestChange from "../../contracts/containers/detail/InterestChange";
import React from "react";
import RightMenu from "./RightMenu";
import TransactionForm from "../containers/TransactionForm";
import TransactionRow from "./TransactionRow";
import { __ } from "coreui/utils";
import { can } from "@erxes/ui/src/utils/core";
import withConsumer from "../../withConsumer";

interface IProps {
  transactions: ITransaction[];
  loading: boolean;
  totalCount: number;
  // TODO: check is below line not throwing error ?
  toggleBulk: () => void;
  toggleAll: (targets: ITransaction[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  removeTransactions: (
    doc: { transactionIds: string[] },
    emptyBulk: () => void
  ) => void;

  onSearch: (search: string) => void;
  onSelect: (values: string[] | string, key: string) => void;
  queryParams: any;
  isFiltered: boolean;
  clearFilter: () => void;
  currentUser: IUser;
}

const TransactionsList = (props: IProps) => {
  const {
    transactions,
    toggleAll,
    loading,
    toggleBulk,
    bulk,
    isAllSelected,
    totalCount,
    queryParams,
    onSelect,
    onSearch,
    isFiltered,
    clearFilter,
    currentUser
  } = props;

  const onChange = () => {
    toggleAll(transactions, "transactions");
  };

  const removeTransactions = (transactions) => {
    const transactionIds: string[] = [];

    transactions.forEach((transaction) => {
      transactionIds.push(transaction._id);
    });

    props.removeTransactions({ transactionIds }, props.emptyBulk);
  };

  const mainContent = (
    <ContractsTableWrapper>
      <Table
        $whiteSpace="nowrap"
        $bordered={true}
        $hover={true}
        $striped={true}
      >
        <thead>
          <tr>
            <th>
              <FormControl
                checked={isAllSelected}
                componentclass="checkbox"
                onChange={onChange}
              />
            </th>
            <th>
              <SortHandler
                sortField={"contract.number"}
                label={__("Contract Number")}
              />
            </th>
            <th>
              <SortHandler
                sortField={"contract.description"}
                label={__("Description")}
              />
            </th>
            <th>
              <SortHandler sortField={"payDate"} label={__("Date")} />
            </th>
            <th>
              <SortHandler sortField={"payment"} label={__("Payment")} />
            </th>
            <th>
              <SortHandler
                sortField={"interestEve"}
                label={__("Interest Eve")}
              />
            </th>
            <th>
              <SortHandler
                sortField={"interestNonce"}
                label={__("Interest Nonce")}
              />
            </th>
            <th>
              <SortHandler sortField={"loss"} label={__("Loss")} />
            </th>
            <th>
              <SortHandler sortField={"insurance"} label={__("Insurance")} />
            </th>
            <th>
              <SortHandler sortField={"total"} label={__("Total")} />
            </th>
            <th>
              <SortHandler sortField={"ebarimt"} label={__("EBarimt")} />
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody id="transactions">
          {transactions.map((transaction) => (
            <TransactionRow
              transaction={transaction}
              isChecked={bulk.includes(transaction)}
              key={transaction._id}
              toggleBulk={toggleBulk}
            />
          ))}
        </tbody>
      </Table>
    </ContractsTableWrapper>
  );

  let actionBarLeft: React.ReactNode;

  if (bulk.length > 0) {
    const onClick = () =>
      confirm()
        .then(() => {
          removeTransactions(bulk);
        })
        .catch((error) => {
          Alert.error(error.message);
        });

    actionBarLeft = (
      <BarItems>
        {currentUser?.configs?.loansConfig?.organizationType ===
          ORGANIZATION_TYPE.ENTITY &&
          can("transactionsRemove", currentUser) && (
            <Button btnStyle="danger" icon="cancel-1" onClick={onClick}>
              {__("Delete")}
            </Button>
          )}
      </BarItems>
    );
  }

  const repaymentForm = (props) => {
    return (
      <TransactionForm {...props} type="repayment" queryParams={queryParams} />
    );
  };

  const giveForm = (props) => {
    return <TransactionForm {...props} type="give" queryParams={queryParams} />;
  };

  const interestChangeForm = (props) => (
    <InterestChange {...props} type="interestChange" />
  );

  const interestReturnForm = (props) => (
    <InterestChange {...props} type="interestReturn" />
  );

  const rightMenuProps = {
    onSelect,
    onSearch,
    isFiltered,
    clearFilter,
    queryParams
  };

  const menuItems = [
    {
      title: "Repayment Transaction",
      trigger: <a href="#Repayment">{__("Repayment Transaction")}</a>,
      content: repaymentForm,
      additionalModalProps: { size: "lg" }
    },
    {
      title: "Give Transaction",
      trigger: <a href="#give">{__("Give Transaction")}</a>,
      content: giveForm,
      additionalModalProps: { size: "lg" }
    },
    {
      title: "Interest Change",
      trigger: <a href="#interest">{__("Interest Change")}</a>,
      content: interestChangeForm,
      additionalModalProps: { size: "lg" }
    },
    {
      title: "Interest Return",
      trigger: <a href="#return">{__("Interest Return")}</a>,
      content: interestReturnForm,
      additionalModalProps: { size: "lg" }
    }
  ];

  const actionBarRight = (
    <BarItems>
      {can("manageTransactions", currentUser) && (
        <Dropdown
          as={DropdownToggle}
          toggleComponent={
            <Button btnStyle="success" size="medium">
              {__("New transaction")}
              <Icon icon="angle-down" />
            </Button>
          }
          modalMenuItems={menuItems}
        />
      )}

      <RightMenu {...rightMenuProps} />
    </BarItems>
  );

  const actionBar = (
    <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__(`Transactions`) + ` (${totalCount})`}
          queryParams={queryParams}
          submenu={menuContracts.filter((row) =>
            can(row.permission, currentUser)
          )}
        />
      }
      hasBorder
      actionBar={actionBar}
      footer={<Pagination count={totalCount} />}
      content={
        <DataWithLoader
          data={mainContent}
          loading={loading}
          count={transactions.length}
          emptyText="Add in your first transaction!"
          emptyImage="/images/actions/1.svg"
        />
      }
    />
  );
};

export default withConsumer(TransactionsList);

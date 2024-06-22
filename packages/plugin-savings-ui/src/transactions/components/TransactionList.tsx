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
  confirm,
} from "@erxes/ui/src";

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
import { menuContracts } from "../../constants";
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
  let timer = undefined;
  const {
    transactions,
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
    currentUser,
    toggleAll,
    emptyBulk,
    removeTransactions,
  } = props;

  const onChange = () => {
    toggleAll(transactions, "transactions");
  };

  const removeTransactionsHandler = (transactions) => {
    const transactionIds: string[] = [];

    transactions.forEach((transaction) => {
      transactionIds.push(transaction._id);
    });

    removeTransactions({ transactionIds }, emptyBulk);
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
              <SortHandler sortField={"total"} label={__("Total")} />
            </th>
            <th>
              <SortHandler sortField={"type"} label={__("Type")} />
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
          removeTransactionsHandler(bulk);
        })
        .catch((error) => {
          Alert.error(error.message);
        });

    actionBarLeft = (
      <BarItems>
        {can("transactionsRemove", currentUser) && (
          <Button btnStyle="danger" icon="cancel-1" onClick={onClick}>
            {__("Delete")}
          </Button>
        )}
      </BarItems>
    );
  }

  const incomeTransactionForm = (props) => {
    return (
      <TransactionForm type="income" {...props} queryParams={queryParams} />
    );
  };

  const outcomeTransactionForm = (props) => {
    return (
      <TransactionForm type="outcome" {...props} queryParams={queryParams} />
    );
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
    queryParams,
  };

  const menuItems = [
    {
      title: "Income Transaction",
      trigger: <a href="#Income Transaction">{__("Income Transaction")}</a>,
      content: incomeTransactionForm,
      additionalModalProps: { size: "lg" },
    },
    {
      title: "Outcome Transaction",
      trigger: <a href="#Outcome Transaction">{__("Outcome Transaction")}</a>,
      content: outcomeTransactionForm,
      additionalModalProps: { size: "lg" },
    },
    {
      title: "Interest Change",
      trigger: <a href="#Interest Change">{__("Interest Change")}</a>,
      content: interestChangeForm,
      additionalModalProps: { size: "lg" },
    },
    {
      title: "Interest Return",
      trigger: <a href="#Interest Return">{__("Interest Return")}</a>,
      content: interestReturnForm,
      additionalModalProps: { size: "lg" },
    },
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
      hasBorder
      header={
        <Wrapper.Header
          title={__(`Transactions`) + ` (${totalCount})`}
          queryParams={queryParams}
          submenu={menuContracts.filter((row) =>
            can(row.permission, currentUser)
          )}
        />
      }
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

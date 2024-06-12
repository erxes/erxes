import {
  Alert,
  BarItems,
  Bulk,
  Button,
  DataWithLoader,
  FormControl,
  Pagination,
  SortHandler,
  Table,
  Wrapper,
  __,
  confirm,
} from "@erxes/ui/src";

import Dropdown from "@erxes/ui/src/components/Dropdown";
import { INonBalanceTransaction } from "../types";
import { IUser } from "@erxes/ui/src/auth/types";
import NonBalanceTransactionForm from "../containers/Form";
import NonBalanceTransactionRow from "./NonBalanceTransactionRow";
import React from "react";
import { TableWrapper } from "@erxes/ui/src/components/table/styles";
import { can } from "@erxes/ui/src/utils/core";
import { menuContracts } from "../../constants";
import withConsumer from "../../withConsumer";

interface IProps {
  nonBalanceTransactions: INonBalanceTransaction[];
  loading: boolean;
  totalCount: number;
  toggleBulk: () => void;
  toggleAll: (targets: INonBalanceTransaction[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  removeNonBalanceTransactions: (
    doc: { nonBalanceTransactionIds: string[] },
    emptyBulk: () => void
  ) => void;
  queryParams: any;
  currentUser: IUser;
  closeModal: () => void;
  tableHeadName: any[];
}

class List extends React.Component<IProps> {
  onChange = () => {
    const { toggleAll, nonBalanceTransactions } = this.props;
    toggleAll(nonBalanceTransactions, "nonBalanceTransactions");
  };

  removeNonBalanceTransactions = (nonBaltransactions) => {
    const nonBalanceTransactionIds: string[] = [];

    nonBaltransactions.forEach((nonBaltransaction) => {
      nonBalanceTransactionIds.push(nonBaltransaction._id);
    });

    this.props.removeNonBalanceTransactions(
      { nonBalanceTransactionIds },
      this.props.emptyBulk
    );
  };
  render() {
    const {
      nonBalanceTransactions,
      loading,
      toggleBulk,
      bulk,
      isAllSelected,
      totalCount,
      queryParams,
      currentUser,
      closeModal,
      tableHeadName,
    } = this.props;

    const mainContent = (
      <TableWrapper>
        <Table $whiteSpace="nowrap" $bordered={true} $hover={true} $striped>
          <thead>
            <tr>
              <th>
                <FormControl
                  checked={isAllSelected}
                  componentclass="checkbox"
                  onChange={this.onChange}
                />
              </th>
              {tableHeadName.map((head) => (
                <th key={head}>{head || ""}</th>
              ))}
              <th>
                <SortHandler
                  sortField={"nonBalanceTransaction.createdAt"}
                  label={__("Create Date")}
                />
              </th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody id="nonBalanceTransactions">
            {nonBalanceTransactions.map((nonBalanceTransaction) => (
              <NonBalanceTransactionRow
                nonBalanceTransaction={nonBalanceTransaction}
                isChecked={bulk.includes(nonBalanceTransaction)}
                key={nonBalanceTransaction._id}
                toggleBulk={toggleBulk}
              />
            ))}
          </tbody>
        </Table>
      </TableWrapper>
    );

    let actionBarLeft: React.ReactNode;
    if (bulk.length > 0) {
      const onClick = () =>
        confirm()
          .then(() => {
            this.removeNonBalanceTransactions(bulk);
          })
          .catch((error) => {
            Alert.error(error.message);
          });

      actionBarLeft = (
        <BarItems>
          {can("nonBalanceTransactionsRemove", currentUser) && (
            <Button
              btnStyle="danger"
              size="medium"
              icon="times-circle"
              onClick={onClick}
            >
              Remove
            </Button>
          )}
        </BarItems>
      );
    }

    const setType = (type) => {
      const content = (props) => {
        return (
          <NonBalanceTransactionForm
            {...props}
            closeModal={closeModal}
            transactionType={type}
            queryParams={queryParams}
          />
        );
      };
      return <Bulk content={content} />;
    };

    const menuItems = [
      {
        title: "collateral",
        trigger: <a href="#collateral">{__("Collateral")}</a>,
        content: () => setType("collateral"),
        additionalModalProps: { size: "lg" },
      },
      {
        title: "Interest Change",
        trigger: <a href="#InterestChange">{__("Interest Change")}</a>,
        content: () => setType("interest"),
        additionalModalProps: { size: "lg" },
      },
      {
        title: "Loan",
        trigger: <a href="#Loan">{__("Loan")}</a>,
        content: () => setType("loan"),
        additionalModalProps: { size: "lg" },
      },
    ];

    const actionBarRight = (
      <BarItems>
        {can("manageTransactions", currentUser) && (
          <Dropdown
            toggleComponent={
              <Button btnStyle="success" size="medium" icon="add">
                {__("Add Non Balance")}
              </Button>
            }
            modalMenuItems={menuItems}
          />
        )}
      </BarItems>
    );

    const actionBar = (
      <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`Non Balance Transactions`) + ` (${totalCount})`}
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
            count={nonBalanceTransactions.length}
            emptyText="Add in your first non balance transaction!"
            emptyImage="/images/actions/1.svg"
          />
        }
      />
    );
  }
}

export default withConsumer(List);

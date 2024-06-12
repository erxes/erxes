import { Alert, __, confirm, router } from "@erxes/ui/src/utils";
import { ITransaction } from "../types";
import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

import { BarItems } from "@erxes/ui/src/layout/styles";
import Button from "@erxes/ui/src/components/Button";
import EmptyState from "@erxes/ui/src/components/EmptyState";
// import Form from "../containers/AccountForm";
import FormControl from "@erxes/ui/src/components/form/Control";
import HeaderDescription from "@erxes/ui/src/components/HeaderDescription";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import Row from "./PtrRow";
import Spinner from "@erxes/ui/src/components/Spinner";
import Table from "@erxes/ui/src/components/table";
import { Title } from "@erxes/ui/src/styles/main";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";

interface IProps {
  queryParams: any;
  transactions: ITransaction[];
  transactionsCount: number;
  isAllSelected: boolean;
  bulk: any[];
  emptyBulk: () => void;
  remove: (accountIds: string[], emptyBulk: () => void) => void;
  toggleBulk: () => void;
  toggleAll: (targets: ITransaction[], containerId: string) => void;
  loading: boolean;
  searchValue: string;
}

const PtrList: React.FC<IProps> = (props) => {
  let timer;

  const {
    transactions,
    toggleBulk,
    bulk,
    toggleAll,
    remove,
    emptyBulk,
    loading,
    isAllSelected,
    transactionsCount,
    queryParams,
  } = props;

  const [searchValue, setSearchValue] = useState<string>(props.searchValue);
  const [checked, setChecked] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (checked && !(bulk || []).length) {
      setChecked(false);
      router.removeParams(navigate, location, "page", "ids");
    }
  }, [checked, bulk]);

  const renderRow = () => {
    return transactions.map((transaction) => (
      <Row
        key={transaction._id}
        transaction={transaction}
        toggleBulk={toggleBulk}
        isChecked={(bulk || []).map((b) => b._id).includes(transaction._id)}
      />
    ));
  };

  const onChange = () => {
    toggleAll(transactions, "transactions");

    if (bulk.length === transactions.length) {
      router.removeParams(navigate, location, "ids");
      router.setParams(navigate, location, { page: 1 });
    }
  };

  const removeAccounts = (transactions) => {
    const accountIds: string[] = [];

    transactions.forEach((account) => {
      accountIds.push(account._id);
    });

    remove(accountIds, emptyBulk);
  };

  const search = (e) => {
    if (timer) {
      clearTimeout(timer);
    }

    const searchValue = e.target.value;

    setSearchValue(searchValue);

    timer = setTimeout(() => {
      router.removeParams(navigate, location, "page");
      router.setParams(navigate, location, { searchValue });
    }, 500);
  };

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;

    e.target.value = "";
    e.target.value = tmpValue;
  };

  const renderContent = () => {
    if (loading) {
      return <Spinner objective={true} />;
    }

    if (!transactionsCount) {
      return (
        <EmptyState
          image="/images/actions/8.svg"
          text="No Brands"
          size="small"
        />
      );
    }

    return (
      <>
        <Table $hover={true}>
          <thead>
            <tr>
              <th style={{ width: 60 }}>
                <FormControl
                  checked={isAllSelected}
                  componentclass="checkbox"
                  onChange={onChange}
                />
              </th>
              <th>{__("Code")}</th>
              <th>{__("Name")}</th>
              <th>{__("Category")}</th>
              <th>{__("Currency")}</th>
              <th>{__("Kind")}</th>
              <th>{__("Journal")}</th>
              <th>{__("Actions")}</th>
            </tr>
          </thead>
          <tbody>{renderRow()}</tbody>
        </Table>
      </>
    );
  };

  const breadcrumb = [
    { title: __("Accountings"), link: "" },
  ];

  const onChangeChecked = (e) => {
    const checked = e.target.checked;

    if (checked && (bulk || []).length) {
      setChecked(true);
      setSearchValue("");
      router.removeParams(
        navigate,
        location,
        "page",
        "searchValue",
        "categoryId"
      );
      router.setParams(navigate, location, {
        ids: (bulk || []).map((b) => b._id).join(","),
      });
    } else {
      setChecked(false);
      router.removeParams(navigate, location, "page", "ids");
    }
  };

  const trigger = (
    <Button btnStyle="success" icon="plus-circle">
      Add account
    </Button>
  );

  const actionBarRight = () => {
    if (bulk.length > 0) {
      return (
        <BarItems>
          <FormControl
            componentclass="checkbox"
            onChange={onChangeChecked}
            checked={checked}
          />
          <FormControl
            type="text"
            placeholder={__("Type to search")}
            onChange={search}
            value={searchValue}
            autoFocus={true}
            onFocus={moveCursorAtTheEnd}
          />
          <Button
            btnStyle="danger"
            icon="cancel-1"
            onClick={removeAccounts.bind(this, bulk)}
          >
            Remove
          </Button>
        </BarItems>
      );
    }

    return (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__("Type to search")}
          onChange={search}
          value={searchValue}
          autoFocus={true}
          onFocus={moveCursorAtTheEnd}
        />
      </BarItems>
    );
  };

  const actionBarLeft = (
    <Title>{`Transactions (${transactionsCount || 0})`}</Title>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__("Perfect Transactions")}
          queryParams={queryParams}
          breadcrumb={breadcrumb}
        />
      }
      mainHead={
        <HeaderDescription
          icon="/images/actions/30.svg"
          title={"Transactions"}
          description={`${__(
            "All information and know-how related to your business transactions and services are found here"
          )}.${__(
            "Create and add in unlimited transactions and servicess so that you and your team members can edit and share"
          )}`}
        />
      }
      actionBar={
        <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight()} />
      }
      // leftSidebar={<CategoryList queryParams={queryParams} />}
      footer={<Pagination count={transactionsCount} />}
      content={renderContent()}
      transparent={true}
      hasBorder={true}
    />
  );
};

export default PtrList;

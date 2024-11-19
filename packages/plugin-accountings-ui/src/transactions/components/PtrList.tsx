import Button from "@erxes/ui/src/components/Button";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import HeaderDescription from "@erxes/ui/src/components/HeaderDescription";
import Spinner from "@erxes/ui/src/components/Spinner";
import FormControl from "@erxes/ui/src/components/form/Control";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import Table from "@erxes/ui/src/components/table";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { BarItems } from "@erxes/ui/src/layout/styles";
import { Title } from "@erxes/ui/src/styles/main";
import { Alert, __, router } from "@erxes/ui/src/utils";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AddTransactionLink from "../containers/AddTr";
import { ITransaction } from "../types";
import { journalConfigMaps } from "../utils/maps";
import Row from "./PtrRow";

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

  const onChange = () => {
    toggleAll(transactions, "transactions");

    if (bulk.length === transactions.length) {
      router.removeParams(navigate, location, "ids");
      router.setParams(navigate, location, { page: 1 });
    }
  };

  const toggleHalf = (id, type, checked) => {
    let trs: ITransaction[] = [];
    if (type === 'parent') {
      trs = transactions.filter(tr => tr.parentId === id)
    } else {
      trs = transactions.filter(tr => tr.ptrId === id)
    }
    toggleAll(trs, "transactions");
  }
  const renderRows = () => {
    let preParentId = '';
    let prePtrId = '';
    return transactions.map((transaction) => {
      const { ptrId, parentId } = transaction;
      const hasNewParent = preParentId !== parentId;
      const hasNewPtr = prePtrId !== ptrId;

      preParentId = parentId || '';
      prePtrId = ptrId || '';

      return <Row
        key={transaction._id}
        transaction={transaction}
        toggleBulk={toggleBulk}
        toggleHalf={toggleHalf}
        isChecked={(bulk || []).map((b) => b._id).includes(transaction._id)}
        hasNewParent={hasNewParent}
        hasNewPtr={hasNewPtr}
      />
    });
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
              <th>{__("Account")}</th>
              <th>{__("Number")}</th>
              <th>{__("Date")}</th>
              <th>{__("Description")}</th>
              <th>{__("Debit")}</th>
              <th>{__("Credit")}</th>
              <th>{__("Branch")}</th>
              <th>{__("Department")}</th>
              <th>{__("Journal")}</th>
              <th>{__("PtrStatus")}</th>
              <th>{__("Actions")}</th>
            </tr>
          </thead>
          <tbody>{renderRows()}</tbody>
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

  const onAddTr = (journal) => {
    if (!journalConfigMaps[journal]) {
      return Alert.error('wron cho')
    }
    navigate(`/accountings/transaction/create?defaultJournal=${journal}`)
  }

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
        <Button
          btnStyle="success"
        >
          <AddTransactionLink onClick={onAddTr} />
        </Button>
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
      footer={<Pagination count={transactionsCount} />}
      content={renderContent()}
      transparent={true}
      hasBorder={true}
    />
  );
};

export default PtrList;

import { Alert, __, router } from "@erxes/ui/src/utils";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AddTransactionLink from "./AddTr";
import { BarItems } from "@erxes/ui/src/layout/styles";
import Button from "@erxes/ui/src/components/Button";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import FormControl from "@erxes/ui/src/components/form/Control";
import HeaderDescription from "@erxes/ui/src/components/HeaderDescription";
import { ITransaction } from "../types";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import { PtrContent } from "../styles";
import Row from "./PtrRow";
import SelectAccount from "../../settings/accounts/containers/SelectAccount";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectDepartment from "@erxes/ui/src/team/containers/SelectDepartments";
import Spinner from "@erxes/ui/src/components/Spinner";
import Table from "@erxes/ui/src/components/table";
import { Title } from "@erxes/ui/src/styles/main";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { journalConfigMaps } from "../utils/maps";
import { AccountingsSubMenus } from "../../constants";

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
  const timerRef = useRef<number | null>(null);

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
  const [searchValues, setSearchValues] = useState<any>({ ...queryParams });
  const [focusedField, setFocusedField] = useState<string>("");
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
    if (type === "parent") {
      trs = transactions.filter((tr) => tr.parentId === id);
    } else {
      trs = transactions.filter((tr) => tr.ptrId === id);
    }
    toggleAll(trs, "transactions");
  };

  const renderRows = () => {
    let preParentId = "";
    let prePtrId = "";

    return transactions.map((transaction) => {
      const { ptrId, parentId } = transaction;
      const hasNewParent = preParentId !== parentId;
      const hasNewPtr = prePtrId !== ptrId;

      preParentId = parentId || "";
      prePtrId = ptrId || "";

      return (
        <Row
          key={transaction._id}
          transaction={transaction}
          toggleBulk={toggleBulk}
          toggleHalf={toggleHalf}
          isChecked={(bulk || []).map((b) => b._id).includes(transaction._id)}
          hasNewParent={hasNewParent}
          hasNewPtr={hasNewPtr}
        />
      );
    });
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

  const onSearchSelect = (key, value) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setSearchValues({ ...searchValues, [key]: value });

    timerRef.current = window.setTimeout(() => {
      router.removeParams(navigate, location, "page");
      router.setParams(navigate, location, { [key]: value });
    }, 800);
  };

  const onSearch = (e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const searchField = e.target.name;
    const searchValue = e.target.value;

    setSearchValues({ ...searchValues, [searchField]: searchValue });
    setFocusedField(searchField);

    timerRef.current = window.setTimeout(() => {
      router.removeParams(navigate, location, "page");
      router.setParams(navigate, location, { [searchField]: searchValue });
    }, 800);
  };

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;

    e.target.value = "";
    e.target.value = tmpValue;
  };

  const renderEmptyState = () => {
    if (loading) {
      return <Spinner objective={true} />;
    }

    if (!transactionsCount) {
      return (
        <EmptyState
          image="/images/actions/28.svg"
          text="No Transactions"
          size="small"
        />
      );
    }

    return null;
  };

  const renderContent = () => {
    return (
      <PtrContent>
        <Table $hover={true} $responsive={true} $whiteSpace="wrap">
          <thead>
            <tr>
              <th rowSpan={2} style={{ width: 40, verticalAlign: "text-top" }}>
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
            <tr>
              <th style={{ width: "180px" }}>
                <SelectAccount
                  multi={false}
                  initialValue={searchValues.accountId || ""}
                  label="Account"
                  name="accountId"
                  onSelect={(accountId) =>
                    onSearchSelect("accountId", accountId)
                  }
                />
              </th>
              <th>
                <FormControl
                  name="number"
                  value={searchValues.number}
                  onChange={onSearch}
                  boxView={true}
                  placeholder="Filter by number"
                  autoFocus={focusedField === "number"}
                />
              </th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th style={{ width: "180px" }}>
                <SelectBranches
                  multi={false}
                  initialValue={searchValues.branchId}
                  label="Branch"
                  name="branchId"
                  onSelect={(branchId) => onSearchSelect("branchId", branchId)}
                />
              </th>
              <th style={{ width: "180px" }}>
                <SelectDepartment
                  multi={false}
                  initialValue={searchValues.departmentId}
                  label="Department"
                  name="departmentId"
                  onSelect={(departmentId) =>
                    onSearchSelect("departmentId", departmentId)
                  }
                />
              </th>
              <th>
                <FormControl
                  name="journal"
                  value={searchValues.journal}
                  onChange={onSearch}
                  boxView={true}
                  placeholder="Filter by journal"
                  autoFocus={focusedField === "journal"}
                />
              </th>
              <th>
                <FormControl
                  name="ptrStatus"
                  value={searchValues.status}
                  onChange={onSearch}
                  boxView={true}
                  placeholder="Filter by status"
                  autoFocus={focusedField === "status"}
                />
              </th>
            </tr>
          </thead>
          <tbody>{renderRows()}</tbody>
        </Table>
        {renderEmptyState()}
      </PtrContent>
    );
  };

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
      return Alert.error("wron cho");
    }
    navigate(`/accountings/transaction/create?defaultJournal=${journal}`);
  };

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
          {/* <Button
            btnStyle="danger"
            icon="cancel-1"
            onClick={removeAccounts.bind(this, bulk)}
          >
            Remove
          </Button> */}
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
        <Button btnStyle="success">
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
          submenu={AccountingsSubMenus}
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

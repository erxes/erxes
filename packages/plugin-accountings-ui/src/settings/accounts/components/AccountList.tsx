import { IAccount, IAccountCategory } from "../types";
import React, { useEffect, useRef, useState } from "react";
import { __, router } from "@erxes/ui/src/utils";
import { useLocation, useNavigate } from "react-router-dom";

import { ACCOUNT_JOURNALS } from "../../../constants";
import { BarItems } from "@erxes/ui/src/layout/styles";
import Button from "@erxes/ui/src/components/Button";
import CategoryList from "./AccountCategoryList";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import Form from "../containers/AccountForm";
import FormControl from "@erxes/ui/src/components/form/Control";
import HeaderDescription from "@erxes/ui/src/components/HeaderDescription";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import Row from "./AccountRow";
import Spinner from "@erxes/ui/src/components/Spinner";
import Table from "@erxes/ui/src/components/table";
import { Title } from "@erxes/ui/src/styles/main";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";

interface IProps {
  queryParams: any;
  accounts: IAccount[];
  accountsCount: number;
  isAllSelected: boolean;
  bulk: any[];
  emptyBulk: () => void;
  remove: (accountIds: string[], emptyBulk: () => void) => void;
  toggleBulk: () => void;
  toggleAll: (targets: IAccount[], containerId: string) => void;
  loading: boolean;
  currentCategory: IAccountCategory;
  currencies: string[];
}

const AccountList: React.FC<IProps> = (props) => {
  const timerRef = useRef<number | null>(null);
  const [focusedField, setFocusedField] = useState<string>("");

  const {
    accounts,
    toggleBulk,
    bulk,
    toggleAll,
    remove,
    emptyBulk,
    loading,
    currentCategory,
    isAllSelected,
    accountsCount,
    queryParams,
    currencies,
  } = props;

  const [searchValues, setSearchValues] = useState<any>({ ...queryParams });
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
    return (accounts || []).map((account) => (
      <Row
        key={account._id}
        account={account}
        toggleBulk={toggleBulk}
        isChecked={(bulk || []).map((b) => b._id).includes(account._id)}
      />
    ));
  };

  const onChange = () => {
    toggleAll(accounts, "accounts");

    if (bulk.length === accounts.length) {
      router.removeParams(navigate, location, "ids");
      router.setParams(navigate, location, { page: 1 });
    }
  };

  const removeAccounts = (accounts) => {
    const accountIds: string[] = [];

    accounts.forEach((account) => {
      accountIds.push(account._id);
    });

    remove(accountIds, emptyBulk);
  };

  const search = (e) => {
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

    if (!accountsCount || accountsCount === 0) {
      return (
        <EmptyState
          image="/images/actions/8.svg"
          text="No Accounts"
          size="small"
        />
      );
    }

    return null;
  };

  const renderContent = () => {
    return (
      <>
        <Table $hover={true}>
          <thead>
            <tr>
              <th rowSpan={2} style={{ width: 60, verticalAlign: "text-top" }}>
                <FormControl
                  checked={isAllSelected}
                  componentclass="checkbox"
                  onChange={onChange}
                />
              </th>
              <th>{__("Code")}</th>
              <th>{__("name")}</th>
              <th>{__("Category")}</th>
              <th>{__("Currency")}</th>
              <th>{__("Kind")}</th>
              <th>{__("Journal")}</th>
              <th rowSpan={2} style={{ verticalAlign: "text-top" }}>
                {__("Actions")}
              </th>
            </tr>
            <tr>
              <th>
                <FormControl
                  name="code"
                  value={searchValues.code}
                  onChange={search}
                  boxView={true}
                  placeholder="Filter by code"
                  autoFocus={focusedField === "code"}
                />
              </th>
              <th>
                <FormControl
                  name="name"
                  value={searchValues.name}
                  onChange={search}
                  boxView={true}
                  placeholder="Filter by name"
                  autoFocus={focusedField === "name"}
                />
              </th>
              <th>
                <FormControl
                  name="category"
                  boxView={true}
                  placeholder="Filter by category"
                  disabled={true}
                />
              </th>
              <th>
                <FormControl
                  componentclass="select"
                  boxView={true}
                  value={searchValues.currency}
                  name="currency"
                  options={[
                    {
                      label: "All",
                      value: "",
                    },
                    ...(currencies || []).map((c) => ({
                      label: c,
                      value: c,
                    })),
                  ]}
                  onChange={search}
                />
              </th>
              <th>
                <FormControl
                  componentclass="select"
                  boxView={true}
                  value={searchValues.kind}
                  name="kind"
                  options={[
                    { label: "All", value: "" },
                    { label: "Active", value: "active" },
                    { label: "Passive", value: "passive" },
                  ]}
                  onChange={search}
                />
              </th>
              <th>
                <FormControl
                  componentclass="select"
                  boxView={true}
                  value={searchValues.journal}
                  name="journals"
                  options={[{ label: "All", value: "" }, ...ACCOUNT_JOURNALS]}
                  onChange={search}
                />
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>{accountsCount ? renderRow() : <div />}</tbody>
        </Table>
        {renderEmptyState()}
      </>
    );
  };

  const breadcrumb = [
    { title: __("Settings"), link: "/settings" },
    { title: __("Accounts") },
  ];

  const onChangeChecked = (e) => {
    const checked = e.target.checked;

    if (checked && (bulk || []).length) {
      setChecked(true);
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

  const modalContent = (props) => <Form {...props} />;

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
            placeholder={__("Type to search")}
            name="searchValue"
            onChange={search}
            value={searchValues.searchValue}
            autoFocus={focusedField === "searchValue"}
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
          name="searchValue"
          onChange={search}
          value={searchValues.searchValue}
          autoFocus={focusedField === "searchValue"}
          onFocus={moveCursorAtTheEnd}
        />
        <ModalTrigger
          title="Add Account"
          trigger={trigger}
          autoOpenKey="showAccountModal"
          content={modalContent}
          size="lg"
        />
      </BarItems>
    );
  };

  const actionBarLeft = (
    <Title>{`${
      currentCategory?.name || "All accounts"
    } (${accountsCount})`}</Title>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__("Accounts")}
          queryParams={queryParams}
          breadcrumb={breadcrumb}
        />
      }
      mainHead={
        <HeaderDescription
          icon="/images/actions/30.svg"
          title={"Accounts"}
          description={`${__(
            "All information and know-how related to your business accounts and services are found here"
          )}.${__(
            "Create and add in unlimited accounts and servicess so that you and your team members can edit and share"
          )}`}
        />
      }
      actionBar={
        <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight()} />
      }
      leftSidebar={<CategoryList queryParams={queryParams} />}
      footer={<Pagination count={accountsCount} />}
      content={renderContent()}
      transparent={true}
      hasBorder={true}
    />
  );
};

export default AccountList;

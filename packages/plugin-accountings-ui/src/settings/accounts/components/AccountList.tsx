import { Alert, __, confirm, router } from "@erxes/ui/src/utils";
import { IAccount, IAccountCategory } from "../types";
import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

import { BarItems } from "@erxes/ui/src/layout/styles";
import Button from "@erxes/ui/src/components/Button";
import CategoryList from "../containers/AccountCategoryList";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import Form from "../containers/AccountForm";
import FormControl from "@erxes/ui/src/components/form/Control";
import HeaderDescription from "@erxes/ui/src/components/HeaderDescription";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import Row from "./AccountRow";
import Spinner from "@erxes/ui/src/components/Spinner";
import { TAG_TYPES } from "@erxes/ui-tags/src/constants";
import Table from "@erxes/ui/src/components/table";
import TaggerPopover from "@erxes/ui-tags/src/components/TaggerPopover";
import TemporarySegment from "@erxes/ui-segments/src/components/filter/TemporarySegment";
import { Title } from "@erxes/ui/src/styles/main";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { isEnabled } from "@erxes/ui/src/utils/core";

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
  searchValue: string;
  currentCategory: IAccountCategory;
}

const AccountList: React.FC<IProps> = (props) => {
  let timer;

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
    return accounts.map((account) => (
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

    if (!accountsCount) {
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
    { title: __("Settings"), link: "/settings" },
    { title: __("Accounts") },
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
    <Title>{`${currentCategory?.name || "All accounts"
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

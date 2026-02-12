import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { gql } from "@apollo/client";
import { Menu } from "@headlessui/react";
import { Link } from "react-router-dom";

import CustomersMerge from "@erxes/ui-contacts/src/customers/containers/CustomersMerge";
import CustomerForm from "@erxes/ui-contacts/src/customers/containers/CustomerForm";
import { queries } from "@erxes/ui-contacts/src/customers/graphql";
import Widget from "@erxes/ui-engage/src/containers/Widget";
import ManageColumns from "@erxes/ui-forms/src/settings/properties/containers/ManageColumns";
import { IConfigColumn } from "@erxes/ui-forms/src/settings/properties/types";
import TemporarySegment from "@erxes/ui-segments/src/components/filter/TemporarySegment";
import { EMPTY_CONTENT_CONTACTS } from "@erxes/ui-settings/src/constants";
import TaggerPopover from "@erxes/ui-tags/src/components/TaggerPopover";
import { TAG_TYPES } from "@erxes/ui-tags/src/constants";
import Button from "@erxes/ui/src/components/Button";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import DateFilter from "@erxes/ui/src/components/DateFilter";
import EmptyContent from "@erxes/ui/src/components/empty/EmptyContent";
import FormControl from "@erxes/ui/src/components/form/Control";
import Icon from "@erxes/ui/src/components/Icon";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import SortHandler from "@erxes/ui/src/components/SortHandler";
import Table from "@erxes/ui/src/components/table";
import withTableWrapper from "@erxes/ui/src/components/table/withTableWrapper";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { BarItems } from "@erxes/ui/src/layout/styles";
import { getVersion } from "@erxes/ui/src/utils/core";
import { menuContacts } from "@erxes/ui/src/utils/menus";
import * as routerUtils from "@erxes/ui/src/utils/router";
import { Alert, __, confirm, router } from "coreui/utils";
import {
  CUSTOMER_STATE_OPTIONS,
  EMAIL_VALIDATION_STATUSES,
  PHONE_VALIDATION_STATUSES
} from "@erxes/ui-contacts/src/customers/constants";

import { ICustomer } from "../../types";
import CustomerRow from "./CustomerRow";
import Sidebar from "./Sidebar";

interface IProps {
  type: string;
  customers: ICustomer[];
  totalCount: number;
  columnsConfig: IConfigColumn[];
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  toggleBulk: (target: ICustomer, toAdd: boolean) => void;
  toggleAll: (targets: ICustomer[], containerId: string) => void;
  loading: boolean;
  mergeCustomerLoading: boolean;
  searchValue: string;
  removeCustomers: (
    doc: { customerIds: string[] },
    emptyBulk: () => void
  ) => void;
  mergeCustomers: (doc: {
    ids: string[];
    data: any;
    callback: () => void;
  }) => Promise<void>;
  verifyCustomers: (doc: { verificationType: string }) => void;
  changeVerificationStatus: (doc: {
    verificationType: string;
    status: string;
    customerIds: string[];
  }) => Promise<void>;
  queryParams: any;
  exportData: (bulk: Array<{ _id: string }>) => void;
  responseId: string;
  refetch?: () => void;
  renderExpandButton?: any;
  isExpand?: boolean;
  page: number;
  perPage: number;
  changeStateBulk: (_ids: string[], value: string) => void;
}

const CustomersList: React.FC<IProps> = props => {
  const navigate = useNavigate();
  const location = useLocation();

 const timerRef = useRef<number | null>(null);

  const [searchValue, setSearchValue] = useState<string | undefined>(
    props.searchValue
  );
  const [searchType, setSearchType] = useState<string | undefined>();

  const { VERSION } = getVersion();

  useEffect(() => {
    if (searchValue && !props.queryParams.searchValue) {
      if (searchType === props.type) {
        routerUtils.setParams(navigate, location, { searchValue });
      } else {
        setSearchValue("");
      }
    }
  }, [searchValue, props.queryParams, props.type]);

  const onChange = () => {
    const { toggleAll, customers } = props;

    toggleAll(customers, "customers");
  };

  const removeCustomersHandler = customers => {
    const customerIds: string[] = [];

    customers.forEach(customer => {
      customerIds.push(customer._id);
    });

    const { removeCustomers, emptyBulk } = props;

    removeCustomers({ customerIds }, emptyBulk);
  };

  const verifyCustomers = (verificationType: string) => {
    const { verifyCustomers } = props;

    verifyCustomers({ verificationType });
  };

  const changeVerificationStatus = (
    type: string,
    status: string,
    customers
  ) => {
    const customerIds: string[] = [];

    customers.forEach(customer => {
      customerIds.push(customer._id);
    });

    const { changeVerificationStatus } = props;

    changeVerificationStatus({ verificationType: type, status, customerIds });
  };

  const changeState = (value: string) => {
    const { type, changeStateBulk, bulk = [] } = props;

    if (type === value) {
      return Alert.warning(`Contacts are already in "${value}" state`);
    }

    const _ids: string[] = bulk.map(c => c._id);

    changeStateBulk(_ids, value);
  };

  const renderContent = () => {
    const {
      customers,
      columnsConfig,
      bulk,
      toggleBulk,
      isAllSelected,
      isExpand,
      perPage,
      page
    } = props;

    return (
      <withTableWrapper.Wrapper>
        <Table
          $whiteSpace="nowrap"
          $hover={true}
          $bordered={true}
          $responsive={true}
          $wideHeader={true}
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
              {(columnsConfig || []).map(({ _id, name, label }) => (
                <th key={name}>
                  {_id !== "#" ? (
                    <SortHandler sortField={name} label={__(label)} />
                  ) : (
                    <>#</>
                  )}
                </th>
              ))}
              <th>{__("Tags")}</th>
            </tr>
          </thead>
          <tbody id="customers" className={isExpand ? "expand" : ""}>
            {(customers || []).map((customer, i) => (
              <CustomerRow
                index={(page - 1) * perPage + i + 1}
                customer={customer}
                columnsConfig={columnsConfig}
                key={customer._id}
                isChecked={bulk.includes(customer)}
                toggleBulk={toggleBulk}
                navigate={navigate}
              />
            ))}
          </tbody>
        </Table>
      </withTableWrapper.Wrapper>
    );
  };

  const search = e => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const { type } = props;
    const value = e.target.value;

    setSearchValue(value);
    setSearchType(type);

    timerRef.current = window.setTimeout(() => {
      router.removeParams(navigate, location, "page", true);
      router.setParams(navigate, location, { searchValue: value, page: 1 });
    }, 500);
  };

  const moveCursorAtTheEnd = e => {
    const tmpValue = e.target.value;

    e.target.value = "";
    e.target.value = tmpValue;
  };

  const afterTag = () => {
    props.emptyBulk();

    if (props.refetch) {
      props.refetch();
    }
  };

  const {
    type,
    totalCount,
    bulk,
    emptyBulk,
    loading,
    customers,
    mergeCustomers,
    queryParams,
    exportData,
    renderExpandButton,
    mergeCustomerLoading
  } = props;

  const addTrigger = (
    <Button btnStyle="success" size="small" icon="plus-circle">
      Add {type || "customer"}
    </Button>
  );

  const onEmailStatusClick = value => {
    changeVerificationStatus("email", value, bulk);
  };

  const onPhoneStatusClick = value => {
    changeVerificationStatus("phone", value, bulk);
  };

  const onStateClick = value => {
    changeState(value);
  };

  const emailVerificationStatusList = [] as any;

  for (const status of EMAIL_VALIDATION_STATUSES) {
    emailVerificationStatusList.push(
      <Menu.Item key={status.value}>
        <a
          id={status.value}
          href="#changeStatus"
          onClick={() => {
            onEmailStatusClick(status.value);
          }}
        >
          {status.label}
        </a>
      </Menu.Item>
    );
  }

  const phoneVerificationStatusList = [] as any;

  for (const status of PHONE_VALIDATION_STATUSES) {
    phoneVerificationStatusList.push(
      <Menu.Item key={status.value}>
        <a
          id={status.value}
          href="#changeStatus"
          onClick={() => {
            onPhoneStatusClick(status.value);
          }}
        >
          {status.label}
        </a>
      </Menu.Item>
    );
  }

  const customerStateOptions: any[] = [];

  for (const option of CUSTOMER_STATE_OPTIONS) {
    customerStateOptions.push(
      <Menu.Item key={option.value}>
        <a id={option.value} href="#changeState" onClick={() => onStateClick(option.value)}>
          {option.label}
        </a>
      </Menu.Item>
    );
  }

  const editColumns = <a href="#edit">{__("Choose Properties/View")}</a>;

  const dateFilter = queryParams.form && (
    <DateFilter queryParams={queryParams} />
  );

  const manageColumns = props => {
    return (
      <ManageColumns
        {...props}
        contentType={`core:${type}`}
        location={location}
        navigate={navigate}
      />
    );
  };

  const customerForm = props => {
    return (
      <CustomerForm
        {...props}
        type={type}
        size="lg"
        queryParams={queryParams}
      />
    );
  };

  const customersMerge = props => {
    return (
      <CustomersMerge
        {...props}
        objects={bulk}
        save={mergeCustomers}
        mergeCustomerLoading={mergeCustomerLoading}
      />
    );
  };

  const actionBarRight = (
    <BarItems>
      <FormControl
        type="text"
        placeholder={__("Type to search")}
        onChange={search}
        value={searchValue}
        autoFocus={true}
        onFocus={moveCursorAtTheEnd}
      />

      {renderExpandButton()}

      {dateFilter}

      <TemporarySegment contentType={`core:${type}`} />

      <Menu as="div" className="relative">
        <Menu.Button>
          <Button btnStyle="simple" size="small">
            {__("Customize ")} <Icon icon="angle-down" />
          </Button>
        </Menu.Button>
        <Menu.Items className="absolute" unmount={false}>
          <Menu.Item>
            <ModalTrigger
              title="Manage Columns"
              trigger={editColumns}
              content={manageColumns}
            />
          </Menu.Item>
          <Menu.Item>
            <Link to="/settings/properties?type=core:customer">
              {__("Manage properties")}
            </Link>
          </Menu.Item>
          <Menu.Item>
            <a href="#export" onClick={exportData.bind(this, bulk)}>
              {type === "lead"
                ? __("Export this leads")
                : __("Export this contacts")}
            </a>
          </Menu.Item>
          {VERSION !== "saas" && (
            <>
              <Menu.Item>
                <a
                  href="#verifyEmail"
                  onClick={verifyCustomers.bind(this, "email")}
                >
                  {__("Verify emails")}
                </a>
              </Menu.Item>
              <Menu.Item>
                <a
                  href="#verifyPhone"
                  onClick={verifyCustomers.bind(this, "phone")}
                >
                  {__("Verify phone numbers")}
                </a>
              </Menu.Item>
            </>
          )}
        </Menu.Items>
      </Menu>
      <Link to={`/settings/importHistories?type=${type}`}>
        <Button btnStyle="primary" size="small" icon="arrow-from-right">
          {__("Go to import")}
        </Button>
      </Link>

      <ModalTrigger
        title="New customer"
        autoOpenKey="showCustomerModal"
        trigger={addTrigger}
        size="lg"
        content={customerForm}
        backDrop="static"
      />
    </BarItems>
  );

  let actionBarLeft: React.ReactNode;

  const mergeButton = (
    <Button btnStyle="primary" size="small" icon="merge">
      Merge
    </Button>
  );

  if (bulk.length > 0) {
    const tagButton = (
      <Button btnStyle="simple" size="small" icon="tag-alt">
        Tag
      </Button>
    );

    const onClick = () =>
      confirm()
        .then(() => {
          removeCustomersHandler(bulk);
        })
        .catch(e => {
          Alert.error(e.message);
        });

    const refetchQuery = {
      query: gql(queries.customerCounts),
      variables: { type, only: "byTag" }
    };

    actionBarLeft = (
      <BarItems>
        {VERSION && VERSION !== "saas" && (
          <Widget customers={bulk} emptyBulk={emptyBulk} />
        )}

        <TaggerPopover
          type={TAG_TYPES.CUSTOMER}
          successCallback={afterTag}
          targets={bulk}
          trigger={tagButton}
          refetchQueries={[refetchQuery]}
        />

        {bulk.length === 2 && (
          <ModalTrigger
            title="Merge Customers"
            size="xl"
            dialogClassName="modal-1000w"
            trigger={mergeButton}
            content={customersMerge}
          />
        )}

        {VERSION && VERSION !== "saas" ? (
          <>
            <Menu as="div" className="relative">
              <Menu.Button>
                <Button btnStyle="simple" size="small">
                  {__("Change email status")} <Icon icon="angle-down" />
                </Button>
              </Menu.Button>
              <Menu.Items className="absolute">
                <div>{emailVerificationStatusList}</div>
              </Menu.Items>
            </Menu>

            <Menu as="div" className="relative">
              <Menu.Button>
                <Button btnStyle="simple" size="small">
                  {__("Change phone status")} <Icon icon="angle-down" />
                </Button>
              </Menu.Button>
              <Menu.Items className="absolute">
                <div>{phoneVerificationStatusList}</div>
              </Menu.Items>
            </Menu>
          </>
        ) : null}

        <Menu as="div" className="relative">
          <Menu.Button>
            <Button btnStyle="simple" size="small">
              {__("Change state")} <Icon icon="angle-down" />
            </Button>
          </Menu.Button>
          <Menu.Items className="absolute">
            <div>{customerStateOptions}</div>
          </Menu.Items>
        </Menu>

        <Button
          btnStyle="danger"
          size="small"
          icon="times-circle"
          onClick={onClick}
        >
          Remove
        </Button>
      </BarItems>
    );
  }

  const actionBar = (
    <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight} />
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__(`Customers`) + ` (${totalCount})`}
          queryParams={queryParams}
          submenu={menuContacts}
        />
      }
      actionBar={actionBar}
      footer={<Pagination count={totalCount} />}
      leftSidebar={
        <Sidebar
          loadingMainQuery={loading}
          type={type}
          queryParams={queryParams}
        />
      }
      content={
        <DataWithLoader
          data={renderContent()}
          loading={loading}
          count={customers.length}
          emptyContent={<EmptyContent content={EMPTY_CONTENT_CONTACTS} />}
        />
      }
      hasBorder={true}
    />
  );
};

export default withTableWrapper("Customer", CustomersList);

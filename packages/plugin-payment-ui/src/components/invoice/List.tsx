import { Alert, __, confirm, router } from "@erxes/ui/src/utils";
import { IInvoice, InvoicesCount } from "../../types";
import React, { useState } from "react";

import { BarItems } from "@erxes/ui/src/layout/styles";
import Button from "@erxes/ui/src/components/Button";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import FormControl from "@erxes/ui/src/components/form/Control";
import InvoiceDetail from "../../containers/invoice/Detail";
import Dialog from "@erxes/ui/src/components/Dialog";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import Row from "./Row";
import Sidebar from "./SideBar";
import Table from "@erxes/ui/src/components/table";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { useLocation, useNavigate } from "react-router-dom";

interface IProps {
  queryParams: any;
  invoices: IInvoice[];
  isAllSelected: boolean;
  bulk: any[];
  emptyBulk: () => void;
  remove: (invoiceIds: string[], emptyBulk: () => void) => void;
  check: (invoiceId: string) => void;
  toggleBulk: () => void;
  toggleAll: (targets: IInvoice[], containerId: string) => void;
  loading: boolean;
  searchValue: string;
  counts: InvoicesCount;
}

const List = (props: IProps) => {
  const [searchValue, setSearchValue] = useState(props.searchValue);
  const [showModal, setShowModal] = useState(false);
  const [currentInvoiceId, setCurrentInvoiceId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { invoices, toggleBulk, toggleAll, bulk, isAllSelected, counts } =
    props;

  React.useEffect(() => {
    let timeoutId: any = null;

    if (searchValue !== props.searchValue) {
      timeoutId = setTimeout(() => {
        router.removeParams(navigate, location, "page");
        router.setParams(navigate, location, { searchValue });
      }, 500);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [searchValue]);

  const renderRow = () => {
    const onClickRow = (invoiceId) => {
      setCurrentInvoiceId(invoiceId);

      setShowModal(!showModal);
    };

    return invoices.map((invoice) => (
      <Row
        onClick={onClickRow}
        key={invoice._id}
        invoice={invoice}
        toggleBulk={toggleBulk}
        check={props.check}
        isChecked={bulk.includes(invoice)}
      />
    ));
  };

  const onChange = () => {
    toggleAll(invoices, "invoices");
  };
  const removeInvoices = (ids) => {
    const invoiceIds: string[] = [];
    ids.forEach((i) => {
      invoiceIds.push(i._id);
    });
    props.remove(invoiceIds, props.emptyBulk);
  };

  const search = (e) => {
    setSearchValue(e.target.value || "");
  };

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;
    e.target.value = "";
    e.target.value = tmpValue;
  };

  let invoiceBarRight = (
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
  const content = (
    <>
      <Table $hover={true}>
        <thead>
          <tr>
            <th
              style={{
                width: 60,
              }}
            >
              <FormControl
                checked={isAllSelected}
                componentclass="checkbox"
                onChange={onChange}
              />
            </th>
            <th>{__("Invoice Number")}</th>
            <th>{__("Amount")}</th>
            <th>{__("Status")}</th>
            <th>{__("Customer")}</th>
            <th>{__("Customer Type")}</th>
            <th>{__("Description")}</th>
            <th>{__("Created date")}</th>
            <th>{__("Resolved date")}</th>
            <th>{__("Actions")}</th>
          </tr>
        </thead>
        <tbody>{renderRow()}</tbody>
      </Table>

      <Dialog
        show={showModal}
        closeModal={() => setShowModal(false)}
        size="lg"
        title={__("Invoice detail")}
      >
        <InvoiceDetail id={currentInvoiceId || ""} />
      </Dialog>
    </>
  );

  if (bulk.length > 0) {
    const onClick = () =>
      confirm(
        __("Invoices that are already paid will not be deleted. Are you sure?")
      )
        .then(() => {
          removeInvoices(bulk);
        })
        .catch((error) => {
          Alert.error(error.message);
        });

    invoiceBarRight = (
      <BarItems>
        <Button
          btnStyle="danger"
          size="small"
          icon="cancel-1"
          onClick={onClick}
        >
          Remove
        </Button>
      </BarItems>
    );
  }

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__("Invoices")}
          breadcrumb={[
            {
              title: __("Invoices"),
            },
          ]}
          queryParams={props.queryParams}
        />
      }
      leftSidebar={<Sidebar counts={props.counts || ({} as InvoicesCount)} />}
      footer={<Pagination count={counts.total} />}
      actionBar={<Wrapper.ActionBar right={invoiceBarRight} />}
      content={
        <DataWithLoader
          data={content}
          loading={props.loading}
          count={counts.total}
          emptyText={__("There is no data")}
          emptyImage="/images/actions/5.svg"
        />
      }
      hasBorder={true}
      transparent={true}
    />
  );
};

export default List;

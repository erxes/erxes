import React, { useEffect, useRef, useState } from "react";
import { __, router } from "@erxes/ui/src/utils";
import { useLocation, useNavigate } from "react-router-dom";

import { BarItems } from "@erxes/ui/src/layout/styles";
import Button from "@erxes/ui/src/components/Button";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import Form from "../containers/VatRowForm";
import FormControl from "@erxes/ui/src/components/form/Control";
import HeaderDescription from "@erxes/ui/src/components/HeaderDescription";
import { IVatRow } from "../types";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import Row from "./VatRowRow";
import Sidebar from "../../configs/components/Sidebar";
import Spinner from "@erxes/ui/src/components/Spinner";
import Table from "@erxes/ui/src/components/table";
import { Title } from "@erxes/ui/src/styles/main";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";

interface IProps {
  queryParams: any;
  vatRows: IVatRow[];
  vatRowsCount: number;
  isAllSelected: boolean;
  bulk: any[];
  emptyBulk: () => void;
  remove: (vatRowIds: string[], emptyBulk: () => void) => void;
  toggleBulk: () => void;
  toggleAll: (targets: IVatRow[], containerId: string) => void;
  loading: boolean;
}

const VatRowList: React.FC<IProps> = (props) => {
  const timerRef = useRef<number | null>(null);
  const [focusedField, setFocusedField] = useState<string>("");

  const {
    vatRows,
    toggleBulk,
    bulk,
    toggleAll,
    remove,
    emptyBulk,
    loading,
    isAllSelected,
    vatRowsCount,
    queryParams,
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
    return vatRows.map((vatRow) => (
      <Row
        key={vatRow._id}
        vatRow={vatRow}
        toggleBulk={toggleBulk}
        isChecked={(bulk || []).map((b) => b._id).includes(vatRow._id)}
      />
    ));
  };

  const onChange = () => {
    toggleAll(vatRows, "vatRows");

    if (bulk.length === vatRows.length) {
      router.removeParams(navigate, location, "ids");
      router.setParams(navigate, location, { page: 1 });
    }
  };

  const removeVatRows = (vatRows) => {
    const vatRowIds: string[] = [];

    vatRows.forEach((vatRow) => {
      vatRowIds.push(vatRow._id);
    });

    remove(vatRowIds, emptyBulk);
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

    if (!vatRowsCount) {
      return (
        <EmptyState image="/images/actions/8.svg" text="No Vat" size="small" />
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
              <th>{__("number")}</th>
              <th>{__("name")}</th>
              <th>{__("kind")}</th>
              <th>{__("status")}</th>
              <th>{__("percent")}</th>
              <th>{__("Actions")}</th>
            </tr>
            <tr>
              <th>
                <FormControl
                  name="number"
                  value={searchValues.number}
                  onChange={search}
                  boxView={true}
                  placeholder="Filter by number"
                  autoFocus={focusedField === "number"}
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
              <th></th>
              <th>
                <FormControl
                  componentclass="select"
                  value={searchValues.status}
                  name="status"
                  boxView={true}
                  options={[
                    { label: "Active", value: undefined },
                    { label: "Deleted", value: "deleted" },
                  ]}
                  onChange={search}
                />
              </th>
              <th>
                <FormControl
                  name="percent"
                  boxView={true}
                  value={searchValues.percent}
                  onChange={search}
                  placeholder="Filter by percent"
                  autoFocus={focusedField === "percent"}
                />
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>{renderRow()}</tbody>
        </Table>
        {renderEmptyState()}
      </>
    );
  };

  const breadcrumb = [
    { title: __("Settings"), link: "/settings" },
    { title: __("VatRows") },
  ];

  const onChangeChecked = (e) => {
    const checked = e.target.checked;

    if (checked && (bulk || []).length) {
      setChecked(true);
      router.removeParams(navigate, location, "page", "searchValue");
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
      Add vatRow
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
            onClick={removeVatRows.bind(this, bulk)}
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
          title="Add VatRow"
          trigger={trigger}
          autoOpenKey="showVatRowModal"
          content={modalContent}
          size="lg"
        />
      </BarItems>
    );
  };

  const actionBarLeft = <Title>{`${"All vatRows"} (${vatRowsCount})`}</Title>;

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__("VatRows")}
          queryParams={queryParams}
          breadcrumb={breadcrumb}
        />
      }
      mainHead={
        <HeaderDescription
          icon="/images/actions/30.svg"
          title={"VatRows"}
          description={`${__(
            "All information and know-how related to your business vatRows and services are found here"
          )}.${__(
            "Create and add in unlimited vatRows and servicess so that you and your team members can edit and share"
          )}`}
        />
      }
      actionBar={
        <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight()} />
      }
      leftSidebar={<Sidebar />}
      footer={<Pagination count={vatRowsCount} />}
      content={renderContent()}
      transparent={true}
      hasBorder={true}
    />
  );
};

export default VatRowList;

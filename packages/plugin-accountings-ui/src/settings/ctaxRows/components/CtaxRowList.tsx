import React, { useEffect, useRef, useState } from "react";
import { __, router } from "@erxes/ui/src/utils";
import { useLocation, useNavigate } from "react-router-dom";

import { BarItems } from "@erxes/ui/src/layout/styles";
import Button from "@erxes/ui/src/components/Button";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import Form from "../containers/CtaxRowForm";
import FormControl from "@erxes/ui/src/components/form/Control";
import HeaderDescription from "@erxes/ui/src/components/HeaderDescription";
import { ICtaxRow } from "../types";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import Row from "./CtaxRowRow";
import Sidebar from "../../configs/components/Sidebar";
import Spinner from "@erxes/ui/src/components/Spinner";
import Table from "@erxes/ui/src/components/table";
import { Title } from "@erxes/ui/src/styles/main";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";

interface IProps {
  queryParams: any;
  ctaxRows: ICtaxRow[];
  ctaxRowsCount: number;
  isAllSelected: boolean;
  bulk: any[];
  emptyBulk: () => void;
  remove: (ctaxRowIds: string[], emptyBulk: () => void) => void;
  toggleBulk: () => void;
  toggleAll: (targets: ICtaxRow[], containerId: string) => void;
  loading: boolean;
}

const CtaxRowList: React.FC<IProps> = (props) => {
  const timerRef = useRef<number | null>(null);
  const [focusedField, setFocusedField] = useState<string>("");

  const {
    ctaxRows,
    toggleBulk,
    bulk,
    toggleAll,
    remove,
    emptyBulk,
    loading,
    isAllSelected,
    ctaxRowsCount,
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
    return ctaxRows.map((ctaxRow) => (
      <Row
        key={ctaxRow._id}
        ctaxRow={ctaxRow}
        toggleBulk={toggleBulk}
        isChecked={(bulk || []).map((b) => b._id).includes(ctaxRow._id)}
      />
    ));
  };

  const onChange = () => {
    toggleAll(ctaxRows, "ctaxRows");

    if (bulk.length === ctaxRows.length) {
      router.removeParams(navigate, location, "ids");
      router.setParams(navigate, location, { page: 1 });
    }
  };

  const removeCtaxRows = (ctaxRows) => {
    const ctaxRowIds: string[] = [];

    ctaxRows.forEach((ctaxRow) => {
      ctaxRowIds.push(ctaxRow._id);
    });

    remove(ctaxRowIds, emptyBulk);
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

    if (!ctaxRowsCount) {
      return (
        <EmptyState image="/images/actions/8.svg" text="No CTax" size="small" />
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
                  autoFocus={focusedField === "number"}
                  placeholder="Filter by number"
                  boxView={true}
                />
              </th>
              <th>
                <FormControl
                  name="name"
                  value={searchValues.name}
                  onChange={search}
                  autoFocus={focusedField === "name"}
                  placeholder="Filter by name"
                  boxView={true}
                />
              </th>
              <th></th>
              <th>
                <FormControl
                  componentclass="select"
                  value={searchValues.status}
                  name="status"
                  options={[
                    { label: "Active", value: undefined },
                    { label: "Deleted", value: "deleted" },
                  ]}
                  onChange={search}
                  boxView={true}
                />
              </th>
              <th>
                <FormControl
                  name="percent"
                  value={searchValues.percent}
                  onChange={search}
                  autoFocus={focusedField === "percent"}
                  placeholder="Filter by percent"
                  boxView={true}
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
    { title: __("CtaxRows") },
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
      Add ctaxRow
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
            onClick={removeCtaxRows.bind(this, bulk)}
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
          title="Add CtaxRow"
          trigger={trigger}
          autoOpenKey="showCtaxRowModal"
          content={modalContent}
          size="lg"
        />
      </BarItems>
    );
  };

  const actionBarLeft = <Title>{`${"All ctaxRows"} (${ctaxRowsCount})`}</Title>;

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__("CtaxRows")}
          queryParams={queryParams}
          breadcrumb={breadcrumb}
        />
      }
      mainHead={
        <HeaderDescription
          icon="/images/actions/30.svg"
          title={"CtaxRows"}
          description={`${__(
            "All information and know-how related to your business ctaxRows and services are found here"
          )}.${__(
            "Create and add in unlimited ctaxRows and servicess so that you and your team members can edit and share"
          )}`}
        />
      }
      actionBar={
        <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight()} />
      }
      leftSidebar={<Sidebar />}
      footer={<Pagination count={ctaxRowsCount} />}
      content={renderContent()}
      transparent={true}
      hasBorder={true}
    />
  );
};

export default CtaxRowList;

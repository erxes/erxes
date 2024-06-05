import React, { useState, useRef } from "react";
import Row from "./YearPlanRow";
import Sidebar from "./YearPlanSidebar";
import { __, Alert, confirm, router } from "@erxes/ui/src/utils";
import { BarItems, Wrapper } from "@erxes/ui/src/layout";
import {
  Button,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Table,
} from "@erxes/ui/src/components";
import { IYearPlan } from "../types";
import Form from "../containers/YearPlanForm";
import { menuSalesplans, MONTHS } from "../../constants";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import { TableWrapper } from "../../styles";
import {
  FlexRow,
  Title,
} from "@erxes/ui-settings/src/styles";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  yearPlans: IYearPlan[];
  totalCount: number;
  loading: boolean;
  totalSum: any;
  isAllSelected: boolean;
  toggleAll: (targets: IYearPlan[], containerId: string) => void;
  queryParams: any;
  bulk: any[];
  emptyBulk: () => void;
  toggleBulk: () => void;
  remove: (doc: { yearPlanIds: string[] }, emptyBulk: () => void) => void;
  edit: (doc: IYearPlan) => void;
  searchValue: string;
};

const YearPlanList = (props: Props) => {
  const {
    yearPlans,
    totalCount,
    loading,
    totalSum,
    isAllSelected,
    toggleAll,
    queryParams,
    bulk,
    emptyBulk,
    toggleBulk,
    remove,
    edit,
    searchValue,
  } = props;

  const [search, setSearch] = useState<string>(searchValue || "");
  const timerRef = useRef<number | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const value = e.target.value;
    setSearch(value);

    timerRef.current = window.setTimeout(() => {
      router.removeParams(navigate, location, "page");
      router.setParams(navigate, location, { searchValue: value });
    }, 500);
  };

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;

    e.target.value = "";
    e.target.value = tmpValue;
  };

  const onChange = () => {
    toggleAll(yearPlans, "yearPlans");
  };

  const renderRow = () => {
    return yearPlans.map((yearPlan) => (
      <Row
        key={yearPlan._id}
        yearPlan={yearPlan}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(yearPlan)}
        edit={edit}
      />
    ));
  };

  const modalContent = (props) => {
    return <Form {...props} />;
  };

  const removeYearPlans = (yearPlans) => {
    const yearPlanIds: string[] = [];

    yearPlans.forEach((yearPlan) => {
      yearPlanIds.push(yearPlan._id);
    });

    remove({ yearPlanIds }, emptyBulk);
  };

  const actionBarRight = () => {
    if (bulk.length) {
      const onClick = () =>
        confirm()
          .then(() => {
            removeYearPlans(bulk);
          })
          .catch((error) => {
            Alert.error(error.message);
          });

      return (
        <Button btnStyle="danger" icon="cancel-1" onClick={onClick}>
          Remove
        </Button>
      );
    }

    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add plans
      </Button>
    );

    return (
      <FlexRow>
        <FormControl
          type="text"
          placeholder={__("Type to search")}
          onChange={handleSearch}
          value={searchValue}
          autoFocus={true}
          onFocus={moveCursorAtTheEnd}
        />
        <ModalTrigger
          title="Add label"
          trigger={trigger}
          autoOpenKey="showProductModal"
          content={modalContent}
        />
      </FlexRow>
    );
  };

  const renderContent = () => {
    return (
      <TableWrapper>
        <Table $hover={true}>
          <thead>
            <tr>
              <th style={{ width: 60 }} rowSpan={2}>
                <FormControl
                  checked={isAllSelected}
                  componentclass="checkbox"
                  onChange={onChange}
                />
              </th>
              <th rowSpan={2}>{__("Year")}</th>
              <th rowSpan={2}>{__("Branch")}</th>
              <th rowSpan={2}>{__("Department")}</th>
              <th rowSpan={2}>{__("Product")}</th>
              <th>{__("Uom")}</th>
              {MONTHS.map((m) => (
                <th key={m}>{m}</th>
              ))}
              <th>{__("Sum")}</th>
              <th>{__("")}</th>
            </tr>
            <tr>
              <th>{__("Sum")}:</th>
              {MONTHS.map((m) => (
                <th key={m}>{totalSum[m]}</th>
              ))}
              <th>
                {Object.values(totalSum).reduce(
                  (sum, i) => Number(sum) + Number(i),
                  0
                )}
              </th>
              <th>{__("")}</th>
            </tr>
          </thead>
          <tbody>{renderRow()}</tbody>
        </Table>
      </TableWrapper>
    );
  };

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__("Sales Year plans")}
          submenu={menuSalesplans}
        />
      }
      actionBar={
        <Wrapper.ActionBar
          left={<Title>{__("Sales Year plans")}</Title>}
          right={actionBarRight()}
        />
      }
      leftSidebar={<Sidebar queryParams={queryParams} />}
      content={
        <DataWithLoader
          data={renderContent()}
          loading={loading}
          count={totalCount}
          emptyText="There is no data"
          emptyImage="/images/actions/5.svg"
        />
      }
      footer={<Pagination count={totalCount} />}
      transparent={true}
      hasBorder
    />
  );
};

export default YearPlanList;

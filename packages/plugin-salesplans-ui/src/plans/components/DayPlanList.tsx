import Form from "../containers/DayPlanForm";
import moment from "moment";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import React, { useState, useRef } from "react";
import Row from "./DayPlanRow";
import Sidebar from "./DayPlanSidebar";
import { __, Alert, confirm, router } from "@erxes/ui/src/utils";
import { BarItems, Wrapper } from "@erxes/ui/src/layout";
import {
  Button,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Table,
} from "@erxes/ui/src/components";
import { IDayPlan, IDayPlanConfirmParams } from "../types";
import { ITimeframe } from "../../settings/types";
import { menuSalesplans } from "../../constants";
import { TableWrapper } from "../../styles";
import { FlexRow, Title } from "@erxes/ui-settings/src/styles";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  dayPlans: IDayPlan[];
  totalCount: number;
  loading: boolean;
  totalSum: any;
  timeFrames: ITimeframe[];
  isAllSelected: boolean;
  toggleAll: (targets: IDayPlan[], containerId: string) => void;
  queryParams: any;
  bulk: any[];
  emptyBulk: () => void;
  toggleBulk: () => void;
  remove: (doc: { dayPlanIds: string[] }, emptyBulk: () => void) => void;
  edit: (doc: IDayPlan) => void;
  searchValue: string;
  toConfirm: (doc: IDayPlanConfirmParams, callback: () => void) => void;
};

const DayPlanList = (props: Props) => {
  const {
    dayPlans,
    totalCount,
    loading,
    totalSum,
    timeFrames,
    isAllSelected,
    toggleAll,
    queryParams,
    bulk,
    emptyBulk,
    toggleBulk,
    remove,
    edit,
    searchValue,
    toConfirm,
  } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const { date, branchId, departmentId, productCategoryId, productId } =
    queryParams;

  const [search, setSearch] = useState<string>(searchValue || "");
  const timerRef = useRef<number | null>(null);

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
    toggleAll(dayPlans, "dayPlans");
  };

  const renderRow = () => {
    return dayPlans.map((dayPlan) => (
      <Row
        key={dayPlan._id}
        dayPlan={dayPlan}
        timeFrames={timeFrames}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(dayPlan)}
        edit={edit}
      />
    ));
  };

  const modalContent = (props) => {
    return <Form {...props} />;
  };

  const removeDayPlans = (dayPlans) => {
    const dayPlanIds: string[] = [];

    dayPlans.forEach((dayPlan) => {
      dayPlanIds.push(dayPlan._id);
    });

    remove({ dayPlanIds }, emptyBulk);
  };

  const actionBarRight = () => {
    const _date = new Date(moment(date).format("YYYY/MM/DD"));

    if (bulk.length) {
      const onClick = () =>
        confirm()
          .then(() => {
            removeDayPlans(bulk);
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
          value={search}
          autoFocus={true}
          onFocus={moveCursorAtTheEnd}
        />
        <ModalTrigger
          title="Add label"
          trigger={trigger}
          autoOpenKey="showProductModal"
          content={modalContent}
        />
        <Button
          btnStyle="primary"
          icon="calcualtor"
          disabled={!(branchId && departmentId && date)}
          // disabled={!(branchId && departmentId && date && _date > new Date())}
          onClick={() =>
            toConfirm(
              {
                date: _date,
                departmentId: (departmentId || "").toString(),
                branchId: (branchId || "").toString(),
                productCategoryId: (productCategoryId || "").toString(),
                productId: (productId || "").toString(),
                ids: bulk.map((b) => b._id),
              },
              emptyBulk
            )
          }
        >
          {__("To Confirm")}
        </Button>
      </FlexRow>
    );
  };

  const renderContent = () => {
    const timeIds = Object.keys(totalSum).filter((k) => k !== "planCount");
    const totalSumValue = timeIds.reduce(
      (sum, i) => Number(sum) + Number(totalSum[i]),
      0
    );
    const totalDiff = totalSumValue - totalSum.planCount;

    return (
      <TableWrapper>
        <Table $hover={true} $responsive={true}>
          <thead>
            <tr>
              <th rowSpan={2} style={{ width: 60 }}>
                <FormControl
                  checked={isAllSelected}
                  componentclass="checkbox"
                  onChange={onChange}
                />
              </th>
              <th rowSpan={2}>{__("Date")}</th>
              <th rowSpan={2}>{__("Branch")}</th>
              <th rowSpan={2}>{__("Department")}</th>
              <th rowSpan={2}>{__("Product")}</th>
              <th>{__("Uom")}</th>
              <th>{__("Plan")}</th>
              {timeFrames.map((tf) => (
                <th key={tf._id}>{tf.name}</th>
              ))}

              <th>{__("Sum")}</th>
              <th>{__("Diff")}</th>
              <th>{__("")}</th>
            </tr>
            <tr>
              <th>{__("Sum")}:</th>
              <th>{(totalSum.planCount || 0).toLocaleString()}</th>
              {timeFrames.map((tf) => (
                <th key={tf._id}>{totalSum[tf._id || ""]}</th>
              ))}

              <th>{(totalSumValue || 0).toLocaleString()}</th>
              <th>{(totalDiff || 0).toLocaleString()}</th>
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
          title={__("Sales Day plans")}
          submenu={menuSalesplans}
        />
      }
      actionBar={
        <Wrapper.ActionBar
          left={<Title>{__("Sales Day plans")}</Title>}
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

export default DayPlanList;

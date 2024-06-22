import Form from "../containers/Form";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import React from "react";
import Row from "./DayLabelRow";
import Sidebar from "./DayLabelSidebar";
import { __, Alert, confirm } from "@erxes/ui/src/utils";
import { BarItems, Wrapper } from "@erxes/ui/src/layout";
import {
  Button,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Table,
} from "@erxes/ui/src/components";
import { IDayLabel } from "../types";
import { menuSalesplans } from "../../constants";
import { FlexRow, Title } from "@erxes/ui-settings/src/styles";

type Props = {
  dayLabels: IDayLabel[];
  totalCount: number;
  loading: boolean;
  isAllSelected: boolean;
  toggleAll: (targets: IDayLabel[], containerId: string) => void;
  queryParams: any;
  bulk: any[];
  emptyBulk: () => void;
  toggleBulk: () => void;
  remove: (doc: { dayLabelIds: string[] }, emptyBulk: () => void) => void;
  edit: (doc: IDayLabel) => void;
  searchValue: string;
};

const DayLabelList = (props: Props) => {
  const {
    queryParams,
    dayLabels,
    totalCount,
    bulk,
    loading,

    remove,
    toggleBulk,
    toggleAll,
    emptyBulk,
    isAllSelected,
  } = props;

  const onChange = () => {
    toggleAll(dayLabels, "dayLabels");
  };

  const renderRow = () => {
    return dayLabels.map((dayLabel) => (
      <Row
        key={dayLabel._id}
        dayLabel={dayLabel}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(dayLabel)}
      />
    ));
  };

  const modalContent = (props) => {
    return <Form {...props} />;
  };

  const removeDayLabels = (dayLabels) => {
    const dayLabelIds: string[] = [];

    dayLabels.forEach((dayLabel) => {
      dayLabelIds.push(dayLabel._id);
    });

    remove({ dayLabelIds }, emptyBulk);
  };

  const actionBarRight = () => {
    if (bulk.length) {
      const onClick = () =>
        confirm()
          .then(() => {
            removeDayLabels(bulk);
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
        Set Labels
      </Button>
    );

    return (
      <FlexRow>
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
            <th>{__("Date")}</th>
            <th>{__("Branch")}</th>
            <th>{__("Department")}</th>
            <th>{__("Labels")}</th>
            <th>{__("")}</th>
          </tr>
        </thead>
        <tbody>{renderRow()}</tbody>
      </Table>
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
          left={<Title>{__("Day labels")}</Title>}
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

export default DayLabelList;

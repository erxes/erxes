import Form from "../../containers/time/TimesForm";
import ManageConfigsContainer from "../../containers/ManageConfigs";
import React from "react";
import Row from "./TimesRow";
import Sidebar from "./Sidebar";
import SidebarWrapper from "../Sidebar";
import { __, Alert, confirm, router } from "@erxes/ui/src/utils";
import { BarItems, Wrapper } from "@erxes/ui/src/layout";
import {
  Button,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Table,
} from "@erxes/ui/src/components";
import { ITimeProportion } from "../../types";
import { FlexRow, Title } from "@erxes/ui-settings/src/styles";

type Props = {
  timeProportions: ITimeProportion[];
  totalCount: number;
  loading: boolean;
  isAllSelected: boolean;
  toggleAll: (targets: ITimeProportion[], containerId: string) => void;
  queryParams: any;
  bulk: any[];
  emptyBulk: () => void;
  toggleBulk: () => void;
  remove: (doc: { timeProportionIds: string[] }, emptyBulk: () => void) => void;
};

const breadcrumb = [
  { title: __("Settings"), link: "/settings" },
  { title: __("Sales Plans Times") },
];

const List = (props: Props) => {
  const {
    queryParams,
    timeProportions,
    totalCount,
    loading,
    isAllSelected,
    bulk,
    toggleBulk,
    toggleAll,
    remove,
    emptyBulk,
  } = props;

  const removeTimeProportion = (timeProportions) => {
    const timeProportionIds: string[] = [];

    timeProportions.forEach((timeProportion) => {
      timeProportionIds.push(timeProportion._id);
    });

    remove({ timeProportionIds }, emptyBulk);
  };

  const renderRow = () => {
    return timeProportions.map((timeProportion) => (
      <Row
        key={timeProportion._id}
        timeProportion={timeProportion}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(timeProportion)}
      />
    ));
  };

  const modalContent = (formProps) => {
    return <Form {...formProps} />;
  };

  const manageConfigContent = (formProps: any) => {
    return <ManageConfigsContainer {...formProps} />;
  };

  const actionBarRight = () => {
    if (bulk.length) {
      const onClick = () =>
        confirm()
          .then(() => {
            removeTimeProportion(bulk);
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

    const manageConfigTrigger = (
      <Button type="button" icon="processor">
        {__("Manage Day interval")}
      </Button>
    );

    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add time proportions
      </Button>
    );

    return (
      <FlexRow>
        <ModalTrigger
          size="lg"
          title={__("Manage Day interval")}
          autoOpenKey="showSLManageDayConfigs"
          trigger={manageConfigTrigger}
          content={manageConfigContent}
          enforceFocus={false}
        />
        <ModalTrigger
          title="Add time proportions"
          trigger={trigger}
          autoOpenKey="showProductModal"
          content={modalContent}
        />
      </FlexRow>
    );
  };

  const renderActionBar = () => {
    const leftAcrionBar = <Title>{__("Sales Plans Times")}</Title>;

    return <Wrapper.ActionBar left={leftAcrionBar} right={actionBarRight()} />;
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
                onChange={() => toggleAll(timeProportions, "timeProportions")}
              />
            </th>
            <th>{__("Branch")}</th>
            <th>{__("Department")}</th>
            <th>{__("Product Category")}</th>
            <th>{__("Percents")}</th>
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
          title={__("Sales Plans Times")}
          breadcrumb={breadcrumb}
        />
      }
      actionBar={renderActionBar()}
      content={
        <DataWithLoader
          data={renderContent()}
          loading={loading}
          count={totalCount}
          emptyText="There is no data"
          emptyImage="/images/actions/5.svg"
        />
      }
      leftSidebar={
        <SidebarWrapper queryParams={queryParams} children={Sidebar} />
      }
      transparent={true}
      hasBorder
    />
  );
};

export default List;

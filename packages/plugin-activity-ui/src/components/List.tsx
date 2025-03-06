import Button from "@erxes/ui/src/components/Button";
import { IActivity, IType } from "../types";
import Row from "./Row";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { __ } from "@erxes/ui/src/utils";
import React from "react";
import Form from "./Form";
import { Title } from "@erxes/ui-settings/src/styles";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import Table from "@erxes/ui/src/components/table";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";

type Props = {
  activities: IActivity[];
  typeId?: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (activity: IActivity) => void;
  edit: (activity: IActivity) => void;
  loading: boolean;
};

function List({
  activities,
  typeId,
  types,
  remove,
  renderButton,
  loading,
  edit,
}: Props) {
  const trigger = (
    <Button id={"AddActivityButton"} btnStyle="success" icon="plus-circle">
      Add Activity
    </Button>
  );

  const modalContent = (props) => (
    <Form
      {...props}
      types={types}
      renderButton={renderButton}
      activities={activities}
    />
  );

  const actionBarRight = (
    <ModalTrigger
      title={__("Add activity")}
      trigger={trigger}
      content={modalContent}
      enforceFocus={false}
    />
  );

  const title = <Title capitalize={true}>{__("Activity")}</Title>;

  const actionBar = (
    <Wrapper.ActionBar left={title} right={actionBarRight} wideSpacing />
  );

  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__("Todo")}</th>
          <th>{__("Expiry Date")}</th>
          <th>{__("Actions")}</th>
        </tr>
      </thead>
      <tbody id={"ActivitiesShowing"}>
        {activities.map((activity) => {
          return (
            <Row
              space={0}
              key={activity._id}
              activity={activity}
              remove={remove}
              edit={edit}
              renderButton={renderButton}
              activities={activities}
              types={types}
            />
          );
        })}
      </tbody>
    </Table>
  );

  const SideBarList = asyncComponent(
    () =>
      import(
        /* webpackChunkName: "List - Activities" */ "../containers/SideBarList"
      )
  );

  const breadcrumb = [
    { title: __("Settings"), link: "/settings" },
    { title: __("Activities"), link: "/activities" },
  ];

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__("Activities")} breadcrumb={breadcrumb} />
      }
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={activities.length}
          emptyText={__("Theres no activity")}
          emptyImage="/images/actions/8.svg"
        />
      }
      leftSidebar={<SideBarList currentTypeId={typeId} />}
      transparent={true}
      hasBorder
    />
  );
}

export default List;

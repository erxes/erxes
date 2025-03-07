import { Title } from "@erxes/ui-settings/src/styles";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import Button from "@erxes/ui/src/components/Button";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import Table from "@erxes/ui/src/components/table";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { __ } from "@erxes/ui/src/utils";
import React from "react";
import { ICurriculum } from "../types";
import Form from "./Form";
import Row from "./Row";

type Props = {
  programs: ICurriculum[];
  typeId?: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (program: ICurriculum) => void;
  edit: (program: ICurriculum) => void;
  loading: boolean;
};

function List({
  programs,
  typeId,
  types,
  remove,
  renderButton,
  loading,
  edit,
}: Props) {
  const trigger = (
    <Button id={"AddCurriculumButton"} btnStyle="success" icon="plus-circle">
      Add Curriculum
    </Button>
  );

  const modalContent = (props) => (
    <Form
      {...props}
      types={types}
      renderButton={renderButton}
      programs={programs}
    />
  );

  const actionBarRight = (
    <ModalTrigger
      title={__("Add program")}
      trigger={trigger}
      content={modalContent}
      enforceFocus={false}
    />
  );

  const title = <Title capitalize={true}>{__("Curriculum")}</Title>;

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
        {programs.map((program) => {
          return (
            <Row
              space={0}
              key={program._id}
              program={program}
              remove={remove}
              edit={edit}
              renderButton={renderButton}
              programs={programs}
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
    { title: __("Activities"), link: "/programs" },
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
          count={programs.length}
          emptyText={__("Theres no program")}
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

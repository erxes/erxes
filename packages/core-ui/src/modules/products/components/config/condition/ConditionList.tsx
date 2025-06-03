import {
  Button,
  DataWithLoader,
  HeaderDescription,
  ModalTrigger,
  Pagination,
  Table
} from "@erxes/ui/src/components";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import Form from "./ConditionForm";
import { Wrapper } from "@erxes/ui/src/layout";
import { __ } from "@erxes/ui/src/utils";
import React from "react";
import Sidebar from "../Sidebar";
import Row from "./Row";
import { Title } from "@erxes/ui-settings/src/styles";
import { IBundleCondition } from "@erxes/ui-products/src/types";

type Props = {
  totalCount: number;
  bundleConditions: IBundleCondition[];
  loading: boolean;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (item: IBundleCondition) => void;
  makeDefault: (item: IBundleCondition) => void;
};

const ConditionList: React.FC<Props> = props => {
  const {
    bundleConditions,
    renderButton,
    remove,
    makeDefault,
    totalCount,
    loading
  } = props;
  const renderContent = () => {
    return (
      <>
        <Table>
          <thead>
            <tr>
              <th>{__("code")}</th>
              <th>{__("Name")}</th>
              <th>{__("default")}</th>
              <th>{__("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {bundleConditions.map(item => {
              return (
                <Row
                  key={item._id}
                  item={item}
                  renderButton={renderButton}
                  remove={remove}
                  makeDefault={makeDefault}
                />
              );
            })}
          </tbody>
        </Table>
        <Pagination count={10} />
      </>
    );
  };

  const breadcrumb = [
    { title: __("Settings"), link: "/settings" },
    { title: __("Bundle Conditions"), link: "/settings/bundle-group" }
  ];

  const addBrand = (
    <Button id={"NewButton"} btnStyle="success" block={true} icon="plus-circle">
      Add Bundle Condition
    </Button>
  );

  const content = props => (
    <Form {...props} extended={true} renderButton={renderButton} />
  );

  const righActionBar = (
    <ModalTrigger
      size="lg"
      title="New Bundle Condition"
      autoOpenKey="showAddModal"
      trigger={addBrand}
      content={content}
    />
  );

  const leftActionBar = (
    <Title>{`All Bundle Conditions (${totalCount})`}</Title>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header title={`Bundle Condition`} breadcrumb={breadcrumb} />
      }
      mainHead={
        <HeaderDescription
          icon="/images/actions/32.svg"
          title={"Bundle Conditions"}
          description={__("Add Bundle Conditions ...")}
        />
      }
      actionBar={
        <Wrapper.ActionBar
          right={righActionBar}
          wideSpacing={true}
          left={leftActionBar}
        />
      }
      leftSidebar={<Sidebar />}
      content={
        <DataWithLoader
          data={renderContent()}
          loading={loading}
          count={totalCount}
          emptyText="Add an integration in this Uom"
          emptyImage="/images/actions/2.svg"
        />
      }
      footer={totalCount > 0 && <Pagination count={totalCount} />}
      hasBorder={true}
    />
  );
};

export default ConditionList;

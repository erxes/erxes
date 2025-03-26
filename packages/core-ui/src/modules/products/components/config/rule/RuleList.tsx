import {
  Button,
  DataWithLoader,
  HeaderDescription,
  ModalTrigger,
  Pagination,
  Table,
} from "@erxes/ui/src/components";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import Form from "./Form";
import { Wrapper } from "@erxes/ui/src/layout";
import { __ } from "@erxes/ui/src/utils";
import React from "react";
import Sidebar from "../Sidebar";
import Row from "./Row";
import { Title } from "@erxes/ui-settings/src/styles";
import { IBundleCondition, IBundleRule } from "@erxes/ui-products/src/types";

type Props = {
  totalCount: number;
  rules: IBundleRule[];
  bundleConditions: IBundleCondition[];
  loading: boolean;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (item: IBundleRule) => void;
};

const RuleList: React.FC<Props> = props => {
  const { rules, renderButton, remove, totalCount, loading, bundleConditions } =
    props;
  const renderContent = () => {
    return (
      <>
        <Table>
          <thead>
            <tr>
              <th>{__("Name")}</th>
              <th>{__("Description")}</th>

              <th>{__("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {rules.map(item => {
              return (
                <Row
                  key={item._id}
                  item={item}
                  renderButton={renderButton}
                  remove={remove}
                  bundleConditions={props.bundleConditions}
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
    { title: __("Bundle Rules"), link: "/settings/bundle-rule" },
  ];

  const addBrand = (
    <Button
      id={"newRuleButton"}
      btnStyle="success"
      block={true}
      icon="plus-circle"
    >
      Add Bundle Rule
    </Button>
  );

  const content = props => (
    <Form
      {...props}
      extended={true}
      renderButton={renderButton}
      bundleConditions={bundleConditions}
    />
  );
  const righActionBar = (
    <ModalTrigger
      size="lg"
      title="New Bundle Rule"
      autoOpenKey="showBundleRuleAddModal"
      trigger={addBrand}
      content={content}
    />
  );

  const leftActionBar = <Title>{`All Bundle Rules (${totalCount})`}</Title>;

  return (
    <Wrapper
      header={<Wrapper.Header title={`Bundle Rule`} breadcrumb={breadcrumb} />}
      mainHead={
        <HeaderDescription
          icon="/images/actions/32.svg"
          title={"Bundle Rules"}
          description={__("Add Bundle Rules ...")}
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

export default RuleList;

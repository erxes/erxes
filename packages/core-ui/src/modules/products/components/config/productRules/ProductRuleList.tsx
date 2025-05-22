import React from "react";

import {
  Button,
  DataWithLoader,
  HeaderDescription,
  ModalTrigger,
  Pagination,
  Table,
} from "@erxes/ui/src/components";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import ProductRuleForm from "./ProductRuleForm";
import { Wrapper } from "@erxes/ui/src/layout";
import { __ } from "@erxes/ui/src/utils";
import Sidebar from "../Sidebar";
import Row from "./ProductRuleRow";
import { Title } from "@erxes/ui-settings/src/styles";
import { IProductRule } from "@erxes/ui-products/src/types";

type Props = {
  totalCount: number;
  rules: IProductRule[];
  loading: boolean;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  removeRule: (_id: string) => void;
};

const RuleList: React.FC<Props> = props => {
  const { rules, renderButton, totalCount, loading, removeRule } = props;

  const renderContent = () => {
    return (
      <>
        <Table>
          <thead>
            <tr>
              <th>{__("Name")}</th>
              <th>{__('Unit price')}</th>
              <th>{__('Categories')}</th>
              <th>{__('Exclude categories')}</th>
              <th>{__('Products')}</th>
              <th>{__('Exclude products')}</th>
              <th>{__('Tags')}</th>
              <th>{__('Exclude tags')}</th>
              <th>{__("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {rules.map(rule => {
              return (
                <Row
                  key={rule._id}
                  rule={rule}
                  removeRule={removeRule}
                  renderButton={renderButton}
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
    { title: __("Product Rules"), link: "/settings/product-rule" },
  ];

  const addButton = (
    <Button
      id={"newRuleButton"}
      btnStyle="success"
      block={true}
      icon="plus-circle"
    >
      Add Product Rule
    </Button>
  );

  const content = props => (
    <ProductRuleForm
      {...props}
      extended={true}
      renderButton={renderButton}
    />
  );
  const rightActionBar = (
    <ModalTrigger
      size="lg"
      title="New Product Rule"
      autoOpenKey="showProductRuleAddModal"
      trigger={addButton}
      content={content}
    />
  );

  const leftActionBar = <Title>{`All Product Rules (${totalCount})`}</Title>;

  return (
    <Wrapper
      header={<Wrapper.Header title={`Product Rule`} breadcrumb={breadcrumb} />}
      mainHead={
        <HeaderDescription
          icon="/images/actions/32.svg"
          title={"Product Rules"}
          description={__("Add Product Rules ...")}
        />
      }
      actionBar={
        <Wrapper.ActionBar
          right={rightActionBar}
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
          emptyText="Add product rule"
          emptyImage="/images/actions/21.svg"
        />
      }
      footer={totalCount > 0 && <Pagination count={totalCount} />}
      hasBorder={true}
    />
  );
};

export default RuleList;

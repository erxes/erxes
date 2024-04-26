import { __, router } from "@erxes/ui/src/utils";
import { useLocation, useNavigate } from "react-router-dom";

import { gql, useQuery } from '@apollo/client';
import Button from "@erxes/ui/src/components/Button";
import CategoryForm from "@erxes/ui-products/src/containers/CategoryForm";
import CollapsibleList from "@erxes/ui/src/components/collapsibleList/CollapsibleList";
import { Header } from "@erxes/ui-settings/src/styles";
import { IBrand } from "@erxes/ui/src/brands/types";
import { IProductCategory } from "../../types";
import Icon from "@erxes/ui/src/components/Icon";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import React from "react";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";
import { SidebarList } from "@erxes/ui/src/layout/styles";
import Tip from "@erxes/ui/src/components/Tip";
import { pluginsOfProductCategoryActions } from "coreui/pluginUtils";
import { IAccountCategoryResponse, accountQuery } from "../graphql/query";
import AccountCategoryForm from "../components/AccountCategoryForm";

interface IProps {
  queryParams: any;
}

const AccountCategoryList: React.FC<IProps> = (props) => {
  const {  queryParams } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const { data, loading } = useQuery<IAccountCategoryResponse>(
    gql(accountQuery.accountCategories),
  );

  const renderFormTrigger = (
    trigger: React.ReactNode,
    category?: IProductCategory
  ) => {
    const content = (props) => (
      <AccountCategoryForm
        {...props}
        category={category}
        categories={data?.accountCategories}
      />
    );

    return (
      <ModalTrigger
        title="Manage category"
        trigger={trigger}
        size="lg"
        content={content}
      />
    );
  };

  const renderEditAction = (category: IProductCategory) => {
    const trigger = (
      <Button btnStyle="link">
        <Tip text={__("Edit")} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return renderFormTrigger(trigger, category);
  };

  const renderRemoveAction = (category: IProductCategory) => {
    return (
      <Button btnStyle="link" >
        <Tip text={__("Remove")} placement="bottom">
          <Icon icon="cancel-1" />
        </Tip>
      </Button>
    );
  };

  const onClick = (id: string) => {
    router.removeParams(navigate, location, "page");
    router.setParams(navigate, location, { accountCategoryId: id });
  };

  const renderContent = () => {
    return (
      <CollapsibleList
        items={data?.accountCategories || []}
        editAction={renderEditAction}
        removeAction={renderRemoveAction}
        additionalActions={pluginsOfProductCategoryActions}
        loading={loading}
        onClick={onClick}
        queryParams={queryParams}
        treeView={
          !["disabled", "archived"].includes(
            router.getParam(location, ["status"])
          )
        }
        keyCount="productCount"
      />
    );
  };

  const renderCategoryHeader = () => {
    const trigger = (
      <Button btnStyle="success" icon="plus-circle" block={true}>
        Add category
      </Button>
    );

    return <Header>{renderFormTrigger(trigger)}</Header>;
  };

  return (
    <Sidebar hasBorder={true}>
      {renderCategoryHeader()}
      <SidebarList>{renderContent()}</SidebarList>
    </Sidebar>
  );
};

export default AccountCategoryList;

import { __, router } from "@erxes/ui/src/utils";
import { useLocation, useNavigate } from "react-router-dom";

import BrandFilter from "@erxes/ui/src/brands/components/BrandFilter";
import Button from "@erxes/ui/src/components/Button";
import CategoryForm from "@erxes/ui-products/src/containers/CategoryForm";
import CategoryStatusFilter from "../product/filters/CategoryStatusFilter";
import CollapsibleList from "@erxes/ui/src/components/collapsibleList/CollapsibleList";
import { Header } from "@erxes/ui-settings/src/styles";
import { IBrand } from "@erxes/ui/src/brands/types";
import { IProductCategory } from "../../types";
import Icon from "@erxes/ui/src/components/Icon";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import ProductTypeFilter from "../product/filters/ProdcutTypeFilter";
import React from "react";
import SegmentFilter from "../product/filters/SegmentFilter";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";
import { SidebarList } from "@erxes/ui/src/layout/styles";
import TagFilter from "../../containers/TagFilter";
import Tip from "@erxes/ui/src/components/Tip";
import { pluginsOfProductCategoryActions } from "coreui/pluginUtils";
import SaveTemplate from "@erxes/ui-template/src/components/SaveTemplate";

interface IProps {
  queryParams: any;
  remove: (productCategoryId: string) => void;
  productCategories: IProductCategory[];
  productCategoriesCount: number;
  loading: boolean;
  brands: IBrand[];
  brandsLoading: boolean;
}

const List: React.FC<IProps> = props => {
  const { productCategories, loading, queryParams, remove } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const renderFormTrigger = (
    trigger: React.ReactNode,
    category?: IProductCategory
  ) => {
    const content = props => (
      <CategoryForm
        {...props}
        category={category}
        categories={productCategories}
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
      <Button btnStyle="link" onClick={remove.bind(null, category._id)}>
        <Tip text={__("Remove")} placement="bottom">
          <Icon icon="cancel-1" />
        </Tip>
      </Button>
    );
  };

  const renderTemplateModal = (category: IProductCategory) => {
    const {
      isRoot,
      productCount,
      ...productCategoryContent
    } = category

    const content = {
      content: JSON.stringify(productCategoryContent),
      contentType: 'productCategories',
      serviceName: 'core'
    };

    return <SaveTemplate as="icon" {...content} />;
  }

  const onClick = (id: string) => {
    router.removeParams(navigate, location, "page");
    router.setParams(navigate, location, { categoryId: id });
  };

  const renderAdditionalActions = (category: IProductCategory) => {

    return (
      <>
        {renderTemplateModal(category)}
        {pluginsOfProductCategoryActions(category)}
      </>
    )
  }

  const renderContent = () => {
    return (
      <CollapsibleList
        items={productCategories}
        editAction={renderEditAction}
        removeAction={renderRemoveAction}
        additionalActions={renderAdditionalActions}
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

      <SegmentFilter loadingMainQuery={props.loading} />

      <CategoryStatusFilter />
      <ProductTypeFilter />
      <BrandFilter
        counts={{}}
        brands={props.brands}
        loading={props.brandsLoading}
      />
      <TagFilter />
    </Sidebar>
  );
};

export default List;

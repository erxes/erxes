import React from "react";
import {
  __,
  Button,
  DataWithLoader,
  Icon,
  router,
  Sidebar,
  SidebarList,
  Tip,
  Wrapper,
} from "@erxes/ui/src";
import { IProductCategory } from "@erxes/ui-products/src/types";
import CollapsibleList from "@erxes/ui/src/components/collapsibleList/CollapsibleList";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
  productCategories: IProductCategory[];
  loading: boolean;
};

const { Section } = Wrapper.Sidebar;

const CategoryList = (props: Props) => {
  const { productCategories, queryParams, loading } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const clearCategoryFilter = () => {
    router.removeParams(navigate, location, "categoryId");
  };

  const isActive = (id: string) => {
    const currentGroup = queryParams.categoryId || "";

    return currentGroup === id;
  };

  const onClick = (id: string) => {
    router.removeParams(navigate, location, "page");
    router.setParams(navigate, location, { categoryId: id });
  };

  const renderContent = () => {
    return (
      <CollapsibleList
        items={productCategories}
        loading={loading}
        onClick={onClick}
        queryParams={queryParams}
        treeView={true}
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

    return (
      <>
        <Section.Title>
          {__("Categories")}

          <Section.QuickButtons>
            {router.getParam(location, "categoryId") && (
              <a href="#cancel" tabIndex={0} onClick={clearCategoryFilter}>
                <Tip text={__("Clear filter")} placement="bottom">
                  <Icon icon="cancel-1" />
                </Tip>
              </a>
            )}
          </Section.QuickButtons>
        </Section.Title>
      </>
    );
  };

  const renderCategoryList = () => {
    return (
      <SidebarList>
        <DataWithLoader
          data={renderContent()}
          loading={loading}
          emptyText={__("There is no product & service category")}
          emptyIcon="folder-2"
          size="small"
        />
      </SidebarList>
    );
  };
  return (
    <Sidebar hasBorder={true}>
      <Section>
        {renderCategoryHeader()}
        {renderCategoryList()}
      </Section>
    </Sidebar>
  );
};

export default CategoryList;

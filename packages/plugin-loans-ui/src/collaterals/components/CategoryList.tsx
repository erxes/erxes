import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import Icon from "@erxes/ui/src/components/Icon";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";
import Tip from "@erxes/ui/src/components/Tip";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";

import { router } from "@erxes/ui/src/utils";
import { IProductCategory } from "@erxes/ui-products/src/types";
import React from "react";
import { Link } from "react-router-dom";
import { __ } from "coreui/utils";

import { SidebarListItem } from "../styles";
import { useLocation, useNavigate } from "react-router-dom";

const { Section } = Wrapper.Sidebar;

interface IProps {
  queryParams: any;
  collateralCategories: IProductCategory[];
  collateralCategoriesCount: number;
  loading: boolean;
}

const List = (props: IProps) => {
  const {
    queryParams,
    collateralCategories,
    collateralCategoriesCount,
    loading,
  } = props;

  const location = useLocation();
  const navigate = useNavigate();

  const clearCategoryFilter = () => {
    router.setParams(navigate, location, { categoryId: null });
  };

  const isActive = (id: string) => {
    const currentGroup = queryParams.categoryId || "";

    return currentGroup === id;
  };

  const renderContent = () => {
    const result: React.ReactNode[] = [];

    for (const category of collateralCategories) {
      const order = category.order;

      const m = order.match(/[/]/gi);

      let space = "";

      if (m) {
        space = "\u00a0\u00a0".repeat(m.length);
      }

      const name = category.isRoot ? (
        `${category.code} - ${category.name}`
      ) : (
        <span>
          {category.code} - {category.name}
        </span>
      );

      result.push(
        <SidebarListItem key={category._id} isActive={isActive(category._id)}>
          <Link to={`?categoryId=${category._id}`}>
            {space}
            {name}
          </Link>
        </SidebarListItem>
      );
    }

    return result;
  };

  const renderCategoryHeader = () => {
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
      <DataWithLoader
        data={renderContent()}
        loading={loading}
        count={collateralCategoriesCount}
        emptyText={__("There is no collateral category")}
        emptyIcon="folder-2"
      />
    );
  };

  return (
    <Sidebar>
      <Section maxHeight={188} $collapsible={collateralCategoriesCount > 9}>
        {renderCategoryHeader()}
        {renderCategoryList()}
      </Section>
    </Sidebar>
  );
};

export default List;

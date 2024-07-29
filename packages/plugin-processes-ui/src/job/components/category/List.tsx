import Button from "@erxes/ui/src/components/Button";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import Icon from "@erxes/ui/src/components/Icon";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import Tip from "@erxes/ui/src/components/Tip";
import { TopHeader } from "@erxes/ui/src/styles/main";
import { router } from "@erxes/ui/src/utils";
import { __ } from "coreui/utils";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { SidebarList } from "@erxes/ui/src/layout/styles";
import { ActionButtons, SidebarListItem } from "@erxes/ui-settings/src/styles";
import React from "react";
import { Link } from "react-router-dom";
import CategoryForm from "../../containers/category/Form";
import { IJobCategory } from "../../types";
import { useLocation, useNavigate } from "react-router-dom";

const { Section } = Wrapper.Sidebar;

interface IProps {
  queryParams: any;
  remove: (jobCategoryId: string) => void;
  jobCategories: IJobCategory[];
  loading: boolean;
  jobCategoriesCount: number;
}

const List = (props: IProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const renderFormTrigger = (
    trigger: React.ReactNode,
    category?: IJobCategory
  ) => {
    const content = props => (
      <CategoryForm
        {...props}
        category={category}
        categories={props.jobCategories}
      />
    );

    return (
      <ModalTrigger title="Add category" trigger={trigger} content={content} />
    );
  };

  const clearCategoryFilter = () => {
    router.setParams(navigate, location, { categoryId: null });
  };

  const isActive = (id: string) => {
    const { queryParams } = props;
    const currentGroup = queryParams.categoryId || "";

    return currentGroup === id;
  };

  const renderEditAction = (category: IJobCategory) => {
    const trigger = (
      <Button btnStyle="link">
        <Tip text={__("Edit")} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return renderFormTrigger(trigger, category);
  };

  const renderRemoveAction = (category: IJobCategory) => {
    const { remove } = props;

    return (
      <Button btnStyle="link" onClick={remove.bind(null, category._id)}>
        <Tip text={__("Remove")} placement="bottom">
          <Icon icon="cancel-1" />
        </Tip>
      </Button>
    );
  };

  const renderContent = () => {
    const { jobCategories } = props;

    const result: React.ReactNode[] = [];

    for (const category of jobCategories) {
      const order = category.order || "";

      const m = order.match(/[/]/gi);

      let space = "";

      if (m) {
        space = "\u00a0\u00a0".repeat(m.length);
      }

      const name = category.isRoot ? (
        `${category.name} (${category.productCount || 0})`
      ) : (
        <span>
          {category.name} ({category.productCount || 0})
        </span>
      );

      result.push(
        <SidebarListItem key={category._id} $isActive={isActive(category._id)}>
          <Link to={`?categoryId=${category._id}`}>
            {space}
            {name}
          </Link>
          <ActionButtons>
            {renderEditAction(category)}
            {renderRemoveAction(category)}
          </ActionButtons>
        </SidebarListItem>
      );
    }

    return result;
  };

  const renderCategoryHeader = () => {
    const trigger = (
      <Button btnStyle="success" icon="plus-circle" block={true}>
        Add category
      </Button>
    );

    return (
      <>
        <TopHeader>{renderFormTrigger(trigger)}</TopHeader>
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
    const { jobCategoriesCount, loading } = props;

    return (
      <SidebarList>
        <DataWithLoader
          data={renderContent()}
          loading={loading}
          count={jobCategoriesCount}
          emptyText="There is no job & service category"
          emptyIcon="folder-2"
          size="small"
        />
      </SidebarList>
    );
  };

  return (
    <Sidebar wide={true} hasBorder={true}>
      <Section maxHeight={488} $collapsible={props.jobCategoriesCount > 9}>
        {renderCategoryHeader()}
        {renderCategoryList()}
      </Section>
      {/* <CategoryStatusFilter /> */}
      {/* <ProductTypeFilter /> */}

      {/* <TagFilter /> */}
    </Sidebar>
  );
};

export default List;

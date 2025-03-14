import { Header } from "@erxes/ui-settings/src/styles";
import {
  Button,
  DataWithLoader,
  Icon,
  ModalTrigger,
  SidebarList,
  Tip,
  Wrapper,
} from "@erxes/ui/src";
import CollapsibleList from "@erxes/ui/src/components/collapsibleList/CollapsibleList";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";
import { __, router } from "@erxes/ui/src/utils";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IProgramCategory } from "../../types";

type Props = {
  queryParams: any;
  refetch: any;
  remove: (programCategoryId: string) => void;
  programCategories: IProgramCategory[];
  totalCount: number;
  loading: boolean;
};

const { Section } = Wrapper.Sidebar;

const CategoryList = (props: Props) => {
  const { queryParams, remove, programCategories, totalCount, loading } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const clearCategoryFilter = () => {
    router.setParams(navigate, location, { categoryId: null });
  };

  const renderFormTrigger = (
    trigger: React.ReactNode,
    category?: IProgramCategory
  ) => {
    const content = (props) => null;

    return (
      <ModalTrigger
        title={__("Add category")}
        trigger={trigger}
        content={content}
      />
    );
  };

  const renderEditAction = (category: IProgramCategory) => {
    const trigger = (
      <Button btnStyle="link">
        <Tip text={__("Edit")} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return renderFormTrigger(trigger, category);
  };

  const renderRemoveAction = (category: IProgramCategory) => {
    return (
      <Button btnStyle="link" onClick={remove.bind(null, category._id)}>
        <Tip text={__("Remove")} placement="bottom">
          <Icon icon="cancel-1" />
        </Tip>
      </Button>
    );
  };

  const handleClick = (categoryId) => {
    router.removeParams(navigate, location, "page");
    router.setParams(navigate, location, { categoryId: categoryId });
  };

  const renderContent = () => {
    return (
      <SidebarList>
        <CollapsibleList
          items={programCategories}
          editAction={renderEditAction}
          removeAction={renderRemoveAction}
          loading={loading}
          queryParams={queryParams}
          queryParamName="categoryId"
          treeView={true}
          keyCount="programCount"
          onClick={handleClick}
        />
      </SidebarList>
    );
  };

  const renderCategoryList = () => {
    return (
      <DataWithLoader
        data={renderContent()}
        loading={loading}
        count={totalCount}
        emptyText={__("There is no program category")}
        emptyIcon="folder-2"
        size="small"
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

export default CategoryList;

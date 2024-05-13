import Button from "@erxes/ui/src/components/Button";
import CategoryFilter from "./filters/CategoryFilter";
import CategoryForm from "../containers/CategoryForm";
import { Header } from "@erxes/ui-settings/src/styles";
import { IAssetCategoryTypes } from "../../common/types";
import KnowledgebaseFilter from "../containers/filters/KnowledgebaseFilter";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import React from "react";
import StatusFilter from "./filters/StatusFilter";
import { Wrapper } from "@erxes/ui/src/layout";
import { isEnabled } from "@erxes/ui/src/utils/core";

type Props = {
  assetCategories: IAssetCategoryTypes[];
  totalCount: number;
  loading: boolean;
  remove: (_id) => any;
  refetchAssetCategories: () => void;
  queryParams: any;
};

const Sidebar = (props: Props) => {
  const {
    assetCategories,
    totalCount,
    loading,
    remove,
    refetchAssetCategories,
    queryParams,
  } = props;

  const trigger = (
    <Button btnStyle="success" block={true} icon="plus-circle">
      Add Category
    </Button>
  );

  const content = (props) => {
    const updatedProps = {
      ...props,
      refetchAssetCategories,
      categories: assetCategories,
    };

    return <CategoryForm {...updatedProps} />;
  };

  const header = (
    <Header>
      <ModalTrigger
        title="Add Asset Category"
        autoOpenKey="showAssetCategoryAddModal"
        trigger={trigger}
        content={content}
      />
    </Header>
  );

  const renderCategoryFilter = () => {
    const updatedProps = {
      assetCategories,
      totalCount,
      loading,
      remove,
      refetchAssetCategories,
      queryParams,
    };

    return <CategoryFilter {...updatedProps} />;
  };

  const renderStatusFilter = () => {
    return <StatusFilter queryParams={queryParams} />;
  };

  const renderKnowledgebaseFilter = () => {
    return <KnowledgebaseFilter queryParams={queryParams} />;
  };

  return (
    <Wrapper.Sidebar hasBorder={true} header={header}>
      {renderCategoryFilter()}
      {renderStatusFilter()}
      {isEnabled("knowledgebase") && renderKnowledgebaseFilter()}
    </Wrapper.Sidebar>
  );
};

export default Sidebar;

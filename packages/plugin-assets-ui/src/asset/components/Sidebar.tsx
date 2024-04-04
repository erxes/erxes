import React from 'react';
import { Wrapper } from '@erxes/ui/src/layout';
import Button from '@erxes/ui/src/components/Button';
import { Header } from '@erxes/ui-settings/src/styles';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import StatusFilter from './filters/StatusFilter';
import KnowledgebaseFilter from '../containers/filters/KnowledgebaseFilter';
import { isEnabled } from '@erxes/ui/src/utils/core';
import CategoryForm from '../containers/CategoryForm';
import { IAssetCategoryTypes } from '../../common/types';
import CategoryFilter from './filters/CategoryFilter';

type Props = {
  assetCategories: IAssetCategoryTypes[];
  totalCount: number;
  loading: boolean;
  remove: (_id) => any;
  refetchAssetCategories: () => void;
  queryParams: any;
  history: any;
};

function Sidebar({
  assetCategories,
  totalCount,
  loading,
  remove,
  refetchAssetCategories,
  queryParams,
  history
}: Props) {
  const trigger = (
    <Button btnStyle="success" block={true} icon="plus-circle">
      Add Category
    </Button>
  );

  const content = props => {
    const updatedProps = {
      ...props,
      refetchAssetCategories,
      categories: assetCategories
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
      history
    };

    return <CategoryFilter {...updatedProps} />;
  };

  const renderStatusFilter = () => {
    return <StatusFilter queryParams={queryParams} history={history} />;
  };

  const renderKnowledgebaseFilter = () => {
    return <KnowledgebaseFilter queryParams={queryParams} history={history} />;
  };

  return (
    <Wrapper.Sidebar hasBorder={true} header={header}>
      {renderCategoryFilter()}
      {renderStatusFilter()}
      {isEnabled('knowledgebase') && renderKnowledgebaseFilter()}
    </Wrapper.Sidebar>
  );
}

export default Sidebar;

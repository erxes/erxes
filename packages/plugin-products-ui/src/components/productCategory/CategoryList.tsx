import { router, __ } from '@erxes/ui/src/utils';

import CategoryForm from '@erxes/ui-products/src/containers/CategoryForm';
import { Header } from '@erxes/ui-settings/src/styles';
import BrandFilter from '@erxes/ui/src/brands/components/BrandFilter';
import { IBrand } from '@erxes/ui/src/brands/types';
import Button from '@erxes/ui/src/components/Button';
import CollapsibleList from '@erxes/ui/src/components/collapsibleList/CollapsibleList';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tip from '@erxes/ui/src/components/Tip';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { pluginsOfProductCategoryActions } from 'coreui/pluginUtils';
import React from 'react';
import TagFilter from '../../containers/TagFilter';
import { IProductCategory } from '../../types';
import CategoryStatusFilter from '../product/filters/CategoryStatusFilter';
import ProductTypeFilter from '../product/filters/ProdcutTypeFilter';
import SegmentFilter from '../product/filters/SegmentFilter';

interface IProps {
  history: any;
  queryParams: any;
  remove: (productCategoryId: string) => void;
  productCategories: IProductCategory[];
  productCategoriesCount: number;
  loading: boolean;
  brands: IBrand[];
  brandsLoading: boolean;
}

const List: React.FC<IProps> = (props) => {
  const { productCategories, loading, queryParams, history, remove } = props;

  const renderFormTrigger = (
    trigger: React.ReactNode,
    category?: IProductCategory,
  ) => {
    const content = (props) => (
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
        <Tip text={__('Edit')} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return renderFormTrigger(trigger, category);
  };

  const renderRemoveAction = (category: IProductCategory) => {
    return (
      <Button btnStyle="link" onClick={remove.bind(null, category._id)}>
        <Tip text={__('Remove')} placement="bottom">
          <Icon icon="cancel-1" />
        </Tip>
      </Button>
    );
  };

  const onClick = (id: string) => {
    router.removeParams(history, 'page');
    router.setParams(history, { categoryId: id });
  };

  const renderContent = () => {
    return (
      <CollapsibleList
        items={productCategories}
        editAction={renderEditAction}
        removeAction={renderRemoveAction}
        additionalActions={pluginsOfProductCategoryActions}
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

    return <Header>{renderFormTrigger(trigger)}</Header>;
  };

  return (
    <Sidebar hasBorder={true}>
      {renderCategoryHeader()}

      <SidebarList>{renderContent()}</SidebarList>

      {isEnabled('segments') && (
        <SegmentFilter loadingMainQuery={props.loading} />
      )}
      <CategoryStatusFilter />
      <ProductTypeFilter />
      <BrandFilter
        counts={{}}
        brands={props.brands}
        loading={props.brandsLoading}
      />
      {isEnabled('tags') && <TagFilter />}
    </Sidebar>
  );
};

export default List;

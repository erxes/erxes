import { __, router } from '@erxes/ui/src/utils';

import Button from '@erxes/ui/src/components/Button';
import CategoryForm from '@erxes/ui-products/src/containers/CategoryForm';
import CategoryStatusFilter from '../product/filters/CategoryStatusFilter';
import CollapsibleList from '@erxes/ui/src/components/collapsibleList/CollapsibleList';
import { Header } from '@erxes/ui-settings/src/styles';
import { IProductCategory } from '../../types';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import ProductTypeFilter from '../product/filters/ProdcutTypeFilter';
import React from 'react';
import SegmentFilter from '../product/filters/SegmentFilter';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import TagFilter from '../../containers/TagFilter';
import Tip from '@erxes/ui/src/components/Tip';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { pluginsOfProductCategoryActions } from 'coreui/pluginUtils';

const { Section } = Wrapper.Sidebar;

interface IProps {
  history: any;
  queryParams: any;
  remove: (productCategoryId: string) => void;
  productCategories: IProductCategory[];
  productCategoriesCount: number;
  loading: boolean;
}

class List extends React.Component<IProps> {
  renderFormTrigger(trigger: React.ReactNode, category?: IProductCategory) {
    const content = props => (
      <CategoryForm
        {...props}
        category={category}
        categories={this.props.productCategories}
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
  }

  clearCategoryFilter = () => {
    router.setParams(this.props.history, { categoryId: null });
  };

  isActive = (id: string) => {
    const { queryParams } = this.props;
    const currentGroup = queryParams.categoryId || '';

    return currentGroup === id;
  };

  renderEditAction = (category: IProductCategory) => {
    const trigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return this.renderFormTrigger(trigger, category);
  };

  renderRemoveAction = (category: IProductCategory) => {
    const { remove } = this.props;

    return (
      <Button btnStyle="link" onClick={remove.bind(null, category._id)}>
        <Tip text={__('Remove')} placement="bottom">
          <Icon icon="cancel-1" />
        </Tip>
      </Button>
    );
  };

  renderContent() {
    const { productCategories, loading, queryParams } = this.props;

    return (
      <CollapsibleList
        items={productCategories}
        editAction={this.renderEditAction}
        removeAction={this.renderRemoveAction}
        additionalActions={pluginsOfProductCategoryActions}
        loading={loading}
        linkToText={'?categoryId='}
        queryParams={queryParams}
        isProductCategory={true}
        treeView={true}
      />
    );
  }

  renderCategoryHeader() {
    const trigger = (
      <Button btnStyle="success" icon="plus-circle" block={true}>
        Add category
      </Button>
    );

    return (
      <>
        <Header>{this.renderFormTrigger(trigger)}</Header>
        <Section.Title>
          {__('Categories')}

          <Section.QuickButtons>
            {router.getParam(this.props.history, 'categoryId') && (
              <a href="#cancel" tabIndex={0} onClick={this.clearCategoryFilter}>
                <Tip text={__('Clear filter')} placement="bottom">
                  <Icon icon="cancel-1" />
                </Tip>
              </a>
            )}
          </Section.QuickButtons>
        </Section.Title>
      </>
    );
  }

  render() {
    return (
      <Sidebar wide={true} hasBorder={true}>
        {this.renderCategoryHeader()}
        <SidebarList>{this.renderContent()}</SidebarList>

        {isEnabled('segments') && (
          <SegmentFilter loadingMainQuery={this.props.loading} />
        )}
        <CategoryStatusFilter />
        <ProductTypeFilter />
        {isEnabled('tags') && <TagFilter />}
      </Sidebar>
    );
  }
}

export default List;

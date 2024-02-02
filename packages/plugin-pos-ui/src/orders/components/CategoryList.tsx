import queryString from 'query-string';
import React from 'react';
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
} from '@erxes/ui/src';
import { IProductCategory } from '@erxes/ui-products/src/types';
import { Link } from 'react-router-dom';
import { SidebarListItem } from '../../styles';
import CollapsibleList from '@erxes/ui/src/components/collapsibleList/CollapsibleList';

type Props = {
  history: any;
  queryParams: any;
  productCategories: IProductCategory[];
  loading: boolean;
};

const { Section } = Wrapper.Sidebar;

const CategoryList = (props: Props) => {
  const { productCategories, queryParams, history, loading } = props;

  const clearCategoryFilter = () => {
    router.removeParams(history, 'categoryId');
  };

  const isActive = (id: string) => {
    const currentGroup = queryParams.categoryId || '';

    return currentGroup === id;
  };

  const onClick = (id: string) => {
    router.removeParams(history, 'page');
    router.setParams(history, { categoryId: id });
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
          {__('Categories')}

          <Section.QuickButtons>
            {router.getParam(history, 'categoryId') && (
              <a href="#cancel" tabIndex={0} onClick={clearCategoryFilter}>
                <Tip text={__('Clear filter')} placement="bottom">
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
          emptyText="There is no product & service category"
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

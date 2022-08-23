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
  Wrapper
} from '@erxes/ui/src';
import { IProductCategory } from '@erxes/ui-products/src/types';
import { Link } from 'react-router-dom';
import { SidebarListItem } from '../../styles';

const { Section } = Wrapper.Sidebar;

interface IProps {
  history: any;
  queryParams: any;
  productCategories: IProductCategory[];
  loading: boolean;
}

class List extends React.Component<IProps> {
  clearCategoryFilter = () => {
    router.removeParams(this.props.history, 'categoryId');
  };

  isActive = (id: string) => {
    const { queryParams } = this.props;
    const currentGroup = queryParams.categoryId || '';

    return currentGroup === id;
  };

  renderContent() {
    const { productCategories, queryParams } = this.props;

    const otherParams = { ...queryParams };
    delete otherParams.categoryId;
    const qryString = queryString.stringify(otherParams);

    const result: React.ReactNode[] = [];

    for (const category of productCategories) {
      const order = category.order;

      const m = order.match(/[/]/gi);

      let space = '';

      if (m) {
        space = '\u00a0\u00a0'.repeat(m.length);
      }

      const name = category.isRoot ? (
        `${category.name} (${category.productCount})`
      ) : (
        <span>
          {category.name} ({category.productCount})
        </span>
      );

      result.push(
        <SidebarListItem
          key={category._id}
          isActive={this.isActive(category._id)}
        >
          <Link to={`?${qryString}&categoryId=${category._id}`}>
            {space}
            {name}
          </Link>
        </SidebarListItem>
      );
    }

    return result;
  }

  renderCategoryHeader() {
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

  renderCategoryList() {
    const { loading } = this.props;

    return (
      <SidebarList>
        <DataWithLoader
          data={this.renderContent()}
          loading={loading}
          emptyText="There is no product & service category"
          emptyIcon="folder-2"
          size="small"
        />
      </SidebarList>
    );
  }

  render() {
    return (
      <Sidebar wide={true} hasBorder>
        <Section maxHeight={488} noShadow>
          {this.renderCategoryHeader()}
          {this.renderCategoryList()}
        </Section>
      </Sidebar>
    );
  }
}

export default List;

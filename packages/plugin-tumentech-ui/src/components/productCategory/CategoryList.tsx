import React from 'react';
import { Link } from 'react-router-dom';
import { IProductCategory } from '../../types';
import {
  __,
  Button,
  Icon,
  Tip,
  Wrapper,
  DataWithLoader,
  ModalTrigger,
  MainStyleTopHeader as TopHeader,
  router,
  Sidebar,
  SidebarList
} from 'erxes-ui';
import CategoryForm from 'erxes-ui/lib/products/containers/CategoryForm';
import { SidebarListItem } from '../../styles';

const { Section } = Wrapper.Sidebar;

interface IProps {
  history: any;
  queryParams: any;
  remove: (productCategoryId: string) => void;
  productCategories: IProductCategory[];
  productCategoriesCount: number;
  loading: boolean;
}

class CategoryList extends React.Component<IProps> {
  renderFormTrigger(trigger: React.ReactNode, category?: IProductCategory) {
    const content = props => (
      <CategoryForm
        {...props}
        category={category}
        categories={this.props.productCategories}
      />
    );

    return (
      <ModalTrigger title="Add category" trigger={trigger} content={content} />
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

  renderContent() {
    const { productCategories } = this.props;

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
          <Link to={`?categoryId=${category._id}`}>
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
        <TopHeader>{this.renderFormTrigger(trigger)}</TopHeader>
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
    const { productCategoriesCount, loading } = this.props;

    return (
      <SidebarList>
        <DataWithLoader
          data={this.renderContent()}
          loading={loading}
          count={productCategoriesCount}
          emptyText="There is no product & service category"
          emptyIcon="folder-2"
          size="small"
        />
      </SidebarList>
    );
  }

  render() {
    return (
      <Sidebar>
        <Section
          maxHeight={488}
          collapsible={this.props.productCategoriesCount > 9}
        >
          {this.renderCategoryHeader()}
          {this.renderCategoryList()}
        </Section>
      </Sidebar>
    );
  }
}

export default CategoryList;

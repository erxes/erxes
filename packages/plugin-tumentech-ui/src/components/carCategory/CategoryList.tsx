import { router } from '@erxes/ui/src/utils';
import { TopHeader } from '@erxes/ui/src/styles/main';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { __ } from '@erxes/ui/src/utils/core';
import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tip from '@erxes/ui/src/components/Tip';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import { Link } from 'react-router-dom';

import CategoryForm from '../../containers/carCategory/CategoryForm';
import MatchCategoryForm from '../../containers/MatchCategoryForm';
import { ActionButtons, SidebarListItem } from '../../styles';
import { ICarCategory, IProduct, IProductCategory } from '../../types';

const { Section } = Wrapper.Sidebar;

interface IProps {
  history: any;
  queryParams: any;
  refetch: any;
  remove: (carCategoryId: string) => void;
  carCategories: ICarCategory[];
  carCategoriesCount: number;
  loading: boolean;
  productCategories: IProductCategory[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  products: IProduct[];
  saveMatch: (productIds: string[]) => void;
}

class List extends React.Component<IProps> {
  renderFormTrigger(trigger: React.ReactNode, category?: ICarCategory) {
    const content = props => (
      <CategoryForm
        {...props}
        category={category}
        categories={this.props.carCategories}
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

  renderEditAction(category: ICarCategory) {
    const trigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return this.renderFormTrigger(trigger, category);
  }

  renderRemoveAction(category: ICarCategory) {
    const { remove } = this.props;

    return (
      <Button btnStyle="link" onClick={remove.bind(null, category._id)}>
        <Tip text={__('Remove')} placement="bottom">
          <Icon icon="cancel-1" />
        </Tip>
      </Button>
    );
  }

  renderManageAction(carCategory: ICarCategory) {
    const trigger = (
      <Button id="skill-edit-skill" btnStyle="link">
        <Tip text={__('Match')} placement="bottom">
          <Icon icon="briefcase" />
        </Tip>
      </Button>
    );

    // tslint:disable-next-line:no-shadowed-variable
    const contentWithId = (carCategory: ICarCategory) => {
      const content = props => (
        <MatchCategoryForm {...props} carCategory={carCategory} />
      );

      return content;
    };

    return (
      <ModalTrigger
        title="Add Product"
        trigger={trigger}
        size="lg"
        dialogClassName="modal-1000w"
        autoOpenKey="showKBAddMatchModal"
        content={contentWithId(carCategory)}
      />
    );
  }

  renderContent() {
    const { carCategories } = this.props;

    const result: React.ReactNode[] = [];

    for (const category of carCategories) {
      const order = category.order;

      const m = order.match(/[/]/gi);

      let space = '';

      if (m) {
        space = '\u00a0\u00a0'.repeat(m.length);
      }

      const name = category.isRoot ? (
        `${category.name} (${category.carCount})`
      ) : (
        <span>
          {category.name} ({category.carCount})
        </span>
      );

      result.push(
        <SidebarListItem
          key={category._id}
          isActive={this.isActive(category._id)}
          isParent={category.parentId === ''}
        >
          <Link to={`?categoryId=${category._id}`}>
            {space}
            {name}
          </Link>
          <ActionButtons>
            {this.renderEditAction(category)}
            {this.renderManageAction(category)}
            {this.renderRemoveAction(category)}
          </ActionButtons>
        </SidebarListItem>
      );
    }

    return result;
  }

  renderCategoryHeader() {
    const trigger = (
      <Button
        btnStyle="success"
        uppercase={false}
        icon="plus-circle"
        block={true}
      >
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
    const { carCategoriesCount, loading } = this.props;

    return (
      <SidebarList>
        <DataWithLoader
          data={this.renderContent()}
          loading={loading}
          count={carCategoriesCount}
          emptyText="There is no car category"
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
          maxHeight={188}
          collapsible={this.props.carCategoriesCount > 30}
        >
          {this.renderCategoryHeader()}
          {this.renderCategoryList()}
        </Section>
      </Sidebar>
    );
  }
}

export default List;

import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Tip from 'modules/common/components/Tip';
import { IButtonMutateProps } from 'modules/common/types';
import { __, router } from 'modules/common/utils';
import Sidebar from 'modules/layout/components/Sidebar';
import { HelperButtons, SidebarList } from 'modules/layout/styles';
import { ActionButtons, SidebarListItem } from 'modules/settings/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { IProductCategory } from '../../types';
import Form from './CategoryForm';

interface IProps {
  history: any;
  queryParams: any;
  refetch: any;
  remove: (productCategoryId: string) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  productCategories: IProductCategory[];
  productCategoriesCount: number;
  loading: boolean;
}

class List extends React.Component<IProps> {
  renderFormTrigger(trigger: React.ReactNode, category?: IProductCategory) {
    const content = props => this.renderForm({ ...props, category });

    return (
      <ModalTrigger title="Add category" trigger={trigger} content={content} />
    );
  }

  renderForm = props => {
    const { refetch, renderButton, productCategories } = this.props;

    const extendedProps = { ...props, refetch };

    return (
      <Form
        {...extendedProps}
        renderButton={renderButton}
        categories={productCategories}
      />
    );
  };

  clearCategoryFilter = () => {
    router.setParams(this.props.history, { categoryId: null });
  };

  isActive = (id: string) => {
    const { queryParams } = this.props;
    const currentGroup = queryParams.categoryId || '';

    return currentGroup === id;
  };

  renderEditAction(category: IProductCategory) {
    const trigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')}>
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return this.renderFormTrigger(trigger, category);
  }

  renderRemoveAction(category: IProductCategory) {
    const { remove } = this.props;

    return (
      <Button btnStyle="link" onClick={remove.bind(null, category._id)}>
        <Tip text={__('Remove')}>
          <Icon icon="cancel-1" />
        </Tip>
      </Button>
    );
  }

  renderContent() {
    const { productCategories } = this.props;

    const result: React.ReactNode[] = [];

    for (const category of productCategories) {
      const order = category.order;

      const m = order.match(/[/]/gi);

      let space = '';

      if (m) {
        space = '\u00A0 '.repeat(m.length);
      }

      result.push(
        <SidebarListItem
          key={category._id}
          isActive={this.isActive(category._id)}
        >
          <Link to={`?categoryId=${category._id}`}>
            {space}
            <strong>{category.name}</strong>
          </Link>
          <ActionButtons>
            {this.renderEditAction(category)}
            {this.renderRemoveAction(category)}
          </ActionButtons>
        </SidebarListItem>
      );
    }

    return result;
  }

  renderSidebarHeader() {
    const { Header } = Sidebar;

    const trigger = (
      <a href="#add">
        <Tip text={__('Create group')}>
          <Icon icon="add" />
        </Tip>
      </a>
    );

    return (
      <Header uppercase={true}>
        {__('Product & Service Category')}{' '}
        <HelperButtons>
          {this.renderFormTrigger(trigger)}
          {router.getParam(this.props.history, 'categoryId') && (
            <a href="#cancel" tabIndex={0} onClick={this.clearCategoryFilter}>
              <Tip text={__('Clear filter')}>
                <Icon icon="cancel-1" />
              </Tip>
            </a>
          )}
        </HelperButtons>
      </Header>
    );
  }

  render() {
    const { productCategoriesCount, loading } = this.props;

    return (
      <Sidebar full={true} wide={true} header={this.renderSidebarHeader()}>
        <SidebarList>
          <DataWithLoader
            data={this.renderContent()}
            loading={loading}
            count={productCategoriesCount}
            emptyText="There is no product & service category"
            emptyImage="/images/actions/26.svg"
          />
        </SidebarList>
      </Sidebar>
    );
  }
}

export default List;

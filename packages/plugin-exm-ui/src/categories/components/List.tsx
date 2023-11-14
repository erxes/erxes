import { ActionButtons, SidebarListItem } from '@erxes/ui-settings/src/styles';
import {
  Box,
  Button,
  EmptyState,
  Icon,
  ModalTrigger,
  Tip,
  __,
  router
} from '@erxes/ui/src';
import { BarItems } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import Form from '../containers/Form';

type Props = {
  categories: any[];
  totalCount: number;
  queryParams: any;
  history: any;
};

class Categories extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  isActive = (id: string) => {
    const { queryParams } = this.props;
    const currentCategory = queryParams.categoryId || '';

    return currentCategory === id;
  };

  renderList() {
    const { categories } = this.props;

    if (categories.length === 0) {
      return <EmptyState text="No categories" icon="info-circle" />;
    }

    const result: React.ReactNode[] = [];

    for (const category of categories) {
      const order = category.order;

      const m = order.match(/[/]/gi);
      let space = '';

      if (m) {
        space = '\u00a0\u00a0'.repeat(m.length);
      }

      const name = category.isRoot ? (
        `${category.name} (${category.count})`
      ) : (
        <span>
          {category.name} ({category.count})
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
          <ActionButtons>
            {this.renderForm(
              'Add Category',
              <Button btnStyle="link">
                <Tip text="Edit">
                  <Icon icon="edit" />
                </Tip>
              </Button>,
              category
            )}
          </ActionButtons>
        </SidebarListItem>
      );
    }

    return result;
  }

  renderForm(title, trigger, category?) {
    const content = ({ closeModal }) => {
      const updatedProps = {
        ...this.props,
        closeModal,
        category
      };

      return <Form {...updatedProps} />;
    };

    return <ModalTrigger content={content} trigger={trigger} title={title} />;
  }

  render() {
    const { history } = this.props;
    const clearCategoryFilter = () => {
      router.setParams(this.props.history, { categoryId: null });
    };

    const extraButtons = (
      <BarItems>
        {this.renderForm(
          'Add Category',
          <Button btnStyle="link">
            <Icon icon="plus-circle" />
          </Button>
        )}
        <Button btnStyle="link">
          {router.getParam(history, 'categoryId') && (
            <a href="#cancel" tabIndex={0} onClick={clearCategoryFilter}>
              <Tip text={__('Clear filter')} placement="bottom">
                <Icon icon="cancel-1" />
              </Tip>
            </a>
          )}
        </Button>
      </BarItems>
    );

    return (
      <>
        <Box
          title="Categories"
          name="syncSaasCategories"
          extraButtons={extraButtons}
          isOpen={true}
        >
          {this.renderList()}
        </Box>
      </>
    );
  }
}

export default Categories;

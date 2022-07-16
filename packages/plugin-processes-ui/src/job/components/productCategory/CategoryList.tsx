import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tip from '@erxes/ui/src/components/Tip';
import { TopHeader } from '@erxes/ui/src/styles/main';
import { __, router } from '@erxes/ui/src/utils';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import { ActionButtons, SidebarListItem } from '@erxes/ui-settings/src/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import CategoryForm from '../../containers/productCategory/CategoryForm';
import { IJobCategory } from '../../types';

const { Section } = Wrapper.Sidebar;

interface IProps {
  history: any;
  queryParams: any;
  remove: (jobCategoryId: string) => void;
  jobCategories: IJobCategory[];
  loading: boolean;
  jobCategoriesCount: number;
}

class List extends React.Component<IProps> {
  renderFormTrigger(trigger: React.ReactNode, category?: IJobCategory) {
    const content = props => (
      <CategoryForm
        {...props}
        category={category}
        categories={this.props.jobCategories}
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

  renderEditAction(category: IJobCategory) {
    const trigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return this.renderFormTrigger(trigger, category);
  }

  renderRemoveAction(category: IJobCategory) {
    const { remove } = this.props;

    return (
      <Button btnStyle="link" onClick={remove.bind(null, category._id)}>
        <Tip text={__('Remove')} placement="bottom">
          <Icon icon="cancel-1" />
        </Tip>
      </Button>
    );
  }

  renderContent() {
    const { jobCategories } = this.props;

    const result: React.ReactNode[] = [];

    for (const category of jobCategories) {
      const order = category.order || '';

      const m = order.match(/[/]/gi);

      let space = '';

      if (m) {
        space = '\u00a0\u00a0'.repeat(m.length);
      }

      const name = category.isRoot ? (
        `${category.name} (${category.productCount || 0})`
      ) : (
        <span>
          {category.name} ({category.productCount || 0})
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
            {this.renderEditAction(category)}
            {this.renderRemoveAction(category)}
          </ActionButtons>
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
    const { jobCategoriesCount, loading } = this.props;

    return (
      <SidebarList>
        <DataWithLoader
          data={this.renderContent()}
          loading={loading}
          count={jobCategoriesCount}
          emptyText="There is no job & service category"
          emptyIcon="folder-2"
          size="small"
        />
      </SidebarList>
    );
  }

  render() {
    return (
      <Sidebar wide={true} hasBorder={true}>
        <Section
          maxHeight={488}
          collapsible={this.props.jobCategoriesCount > 9}
        >
          {this.renderCategoryHeader()}
          {this.renderCategoryList()}
        </Section>
        {/* <CategoryStatusFilter /> */}
        {/* <ProductTypeFilter />
        {isEnabled('tags') && <TagFilter />} */}
      </Sidebar>
    );
  }
}

export default List;

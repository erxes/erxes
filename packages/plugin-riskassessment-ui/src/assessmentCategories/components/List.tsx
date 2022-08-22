import { ActionButtons, SidebarListItem } from '@erxes/ui-settings/src/styles';
import {
  Button,
  DataWithLoader,
  Icon,
  ModalTrigger,
  router,
  Sidebar,
  SidebarList,
  Spinner,
  Tip,
  Wrapper
} from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { Link } from 'react-router-dom';
import { subOption } from '../../common/utils';
import { Padding } from '../../styles';
import FormContainer from '../container/Form';

type Props = {
  queryParams?: any;
  categories?: any;
  totalCount: number;
  loading: boolean;
  removeCategory: (id: string) => any;
  refetch: () => any;
} & IRouterProps;
const { Section } = Wrapper.Sidebar;
class AssessmentCategories extends React.Component<Props> {
  addModal = () => {
    const trigger = (
      <Button block btnStyle="success">
        Add New Assessment Category
      </Button>
    );

    const content = () => {
      return <FormContainer refetch={this.props.refetch} />;
    };

    return (
      <ModalTrigger
        isAnimate
        title="Add New Assessment Category"
        content={content}
        trigger={trigger}
      />
    );
  };

  removeQueryParams = () => {
    router.removeParams(this.props.history, 'categoryId');
  };

  rightActionBar = (
    <Padding>
      {this.addModal()}
      <Section.Title>
        Categories
        {this.props.queryParams.categoryId && (
          <Button btnStyle="link" onClick={this.removeQueryParams}>
            <Tip text="Clear Filter">
              <Icon icon="cancel-1" />
            </Tip>
          </Button>
        )}
      </Section.Title>
    </Padding>
  );

  renderContent() {
    const { categories } = this.props;

    return categories.map(category => (
      <SidebarListItem key={category._id} isActive={false}>
        <Link to={`?categoryId=${category._id}`}>
          {category.parentId && subOption(category)}
          {category.name}
        </Link>
        <ActionButtons>
          {this.renderCategoryEditAction(category)}
          {this.renderCategoryRemoveAction(category._id)}
        </ActionButtons>
      </SidebarListItem>
    ));
  }

  renderCategoryEditAction(category) {
    const trigger = (
      <Button btnStyle="link">
        <Tip text="Edit" placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    const content = () => {
      return (
        <FormContainer
          trigger={trigger}
          categoryId={category._id}
          formId={category.formId}
        />
      );
    };

    return (
      <ModalTrigger
        isAnimate
        title="Edit Assessment Category"
        content={content}
        trigger={trigger}
      />
    );
  }

  renderCategoryRemoveAction(id: string) {
    const remove = () => {
      this.props.removeCategory(id);
    };
    return (
      <Button btnStyle="link" onClick={remove}>
        <Tip text="Remove" placement="bottom">
          <Icon icon="cancel-1" />
        </Tip>
      </Button>
    );
  }

  renderCategoryList() {
    const { loading, totalCount } = this.props;

    if (loading) {
      return <Spinner objective={true} />;
    }

    return (
      <SidebarList>
        <DataWithLoader
          data={this.renderContent()}
          loading={loading}
          count={totalCount}
          emptyText="There is no product & service category"
          emptyIcon="folder-2"
          size="small"
        />
      </SidebarList>
    );
  }

  render() {
    return (
      <Sidebar wide={true} hasBorder={true} noMargin>
        <Section
          maxHeight={500}
          collapsible={this.props.totalCount > 9}
          noMargin
          noShadow
        >
          {this.rightActionBar}
          {this.renderCategoryList()}
        </Section>
      </Sidebar>
    );
  }
}
export default AssessmentCategories;

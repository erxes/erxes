import { SidebarListItem } from '@erxes/ui-settings/src/styles';
import { ActionButtons, Button, DataWithLoader, Icon, ModalTrigger, Sidebar, SidebarList, Spinner, Tip, Wrapper } from '@erxes/ui/src';
import React from 'react';
import { DefaultWrapper, subOption } from '../../common/utils';
import FormContainer from '../container/Form';
import { Link } from 'react-router-dom';
import { Padding } from '../../styles';

type Props = {
  categories: any;
  totalCount: number;
  loading: boolean;
  removeCategory: (id: string) => any;
};
const { Section } = Wrapper.Sidebar;
class AssessmentCategories extends React.Component<Props> {
  addModal = () => {
    const trigger = (
      <Button block btnStyle="success">
        Add New Assessment Category
      </Button>
    );

    const content = () => {
      return <FormContainer />;
    };

    return <ModalTrigger title="Add New Assessment Category" content={content} trigger={trigger} />;
  };

  rightActionBar = (
    <Padding>
      {this.addModal()}
      <Section.Title>Categories</Section.Title>
    </Padding>
  );

  renderContent() {
    const { categories } = this.props;

    return categories.map((category) => (
      <SidebarListItem key={category._id} isActive={false}>
        <a style={{ margin: 0 }}>
          {category.parentId && subOption(category)}
          {category.name}
        </a>
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
      return <FormContainer trigger={trigger} categoryId={category._id} formId={category.formId} />;
    };

    return <ModalTrigger title="Edit Assessment Category" content={content} trigger={trigger} />;
  }

  renderCategoryRemoveAction(id: string) {
    const r = () => {
      this.props.removeCategory(id);
    };
    return (
      <Button btnStyle="link" onClick={r}>
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
        <DataWithLoader data={this.renderContent()} loading={loading} count={totalCount} emptyText="There is no product & service category" emptyIcon="folder-2" size="small" />
      </SidebarList>
    );
  }

  render() {
    return (
      <Sidebar wide={true} hasBorder={true} noMargin>
        <Section maxHeight={500} collapsible={this.props.totalCount > 9} noMargin noShadow>
          {this.rightActionBar}
          {this.renderCategoryList()}
        </Section>
      </Sidebar>
    );
  }
}
export default AssessmentCategories;

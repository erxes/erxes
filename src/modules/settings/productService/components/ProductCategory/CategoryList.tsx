import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Tip from 'modules/common/components/Tip';
import { __, router } from 'modules/common/utils';
import Sidebar from 'modules/layout/components/Sidebar';
import { HelperButtons, SidebarList } from 'modules/layout/styles';
import GroupForm from 'modules/settings/permissions/components/GroupForm';
import React from 'react';
import { IProductCategory } from '../../types';

type Props = {
  queryParams: any;
  refetch;
  productCategories: IProductCategory[];
  productCategoriesCount: number;
  loading: boolean;
};

class List extends React.Component<Props> {
  renderForm = props => {
    const { refetch, renderButton } = this.props;

    const extendedProps = { ...props, refetch };

    return <GroupForm {...extendedProps} renderButton={renderButton} />;
  };

  renderFormTrigger(trigger: React.ReactNode, object?: IUserGroup) {
    const content = props => this.renderForm({ ...props, object });

    return (
      <ModalTrigger title="New Group" trigger={trigger} content={content} />
    );
  }

  clearCategoryFilter = () => {
    router.setParams(this.props.history, { groupId: null });
  };

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
          {router.getParam(this.props.history, 'groupId') && (
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
    return (
      <Sidebar full={true} wide={true} header={this.renderSidebarHeader()}>
        <SidebarList>
          <div />
        </SidebarList>
      </Sidebar>
    );
  }
}

export default List;

import DataWithLoader from 'modules/common/components/DataWithLoader';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Tip from 'modules/common/components/Tip';
import { IButtonMutateProps } from 'modules/common/types';
import { __, router } from 'modules/common/utils';
import Sidebar from 'modules/layout/components/Sidebar';
import { HelperButtons, SidebarList } from 'modules/layout/styles';
import { IUserGroup } from 'modules/settings/permissions/types';
import React from 'react';
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

  renderFormTrigger(trigger: React.ReactNode, object?: IUserGroup) {
    const content = props => this.renderForm({ ...props, object });

    return (
      <ModalTrigger title="Add category" trigger={trigger} content={content} />
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
    const { productCategoriesCount, loading } = this.props;

    return (
      <Sidebar full={true} wide={true} header={this.renderSidebarHeader()}>
        <SidebarList>
          <DataWithLoader
            data={<div />}
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

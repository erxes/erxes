import { Alert, __, confirm, router } from '@erxes/ui/src/utils';
import { useLocation, useNavigate } from 'react-router-dom';

import { gql, useQuery, useMutation } from '@apollo/client';
import Button from '@erxes/ui/src/components/Button';
import CollapsibleList from '@erxes/ui/src/components/collapsibleList/CollapsibleList';
import { Header } from '@erxes/ui-settings/src/styles';
import CategoryStatusFilter from './filters/CategoryStatusFilter';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import Tip from '@erxes/ui/src/components/Tip';
import { IAccountCategoryResponse, accountQuery } from '../graphql/query';
import AccountCategoryForm from '../components/AccountCategoryForm';
import { IAccountCategoryDocument } from '../../types/IAccountCategory';
import mutation from '../graphql/mutation';

interface IProps {
  queryParams: any;
}

const AccountCategoryList: React.FC<IProps> = (props) => {
  const { queryParams } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const { data, loading } = useQuery<IAccountCategoryResponse>(
    gql(accountQuery.accountCategories)
  );

  const [accountCategoriesRemoveMutation] = useMutation(
    gql(mutation.accountCategoriesRemove),
    {
      onError:(error)=> {
        Alert.error(error.message);
      },
      onCompleted:()=> {
        Alert.success(`You successfully deleted a category`);
      },
    }
  );

  const renderFormTrigger = (
    trigger: React.ReactNode,
    category?: IAccountCategoryDocument
  ) => {
    const content = (props) => (
      <AccountCategoryForm
        {...props}
        defaultValue={category}
        mutation={
          category
            ? mutation.accountCategoriesEdit
            : mutation.accountCategoryAdd
        }
      />
    );

    return (
      <ModalTrigger
        title="Manage category"
        trigger={trigger}
        size="lg"
        content={content}
      />
    );
  };

  const renderEditAction = (category: IAccountCategoryDocument) => {
    const trigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return renderFormTrigger(trigger, category);
  };

  const remove = (productId) => {
    confirm().then(() => {
      accountCategoriesRemoveMutation({
        variables: { id: productId },
        refetchQueries: ['accountCategories', 'accounts']
      })
    });
  };

  const renderRemoveAction = (category: IAccountCategoryDocument) => {
    return (
      <Button btnStyle="link" onClick={remove.bind(null, category._id)}>
        <Tip text={__('Remove')} placement="bottom">
          <Icon icon="cancel-1" />
        </Tip>
      </Button>
    );
  };

  const onClick = (id: string) => {
    router.removeParams(navigate, location, 'page');
    router.setParams(navigate, location, { categoryId: id });
  };

  const renderContent = () => {
    return (
      <CollapsibleList
        items={data?.accountCategories || []}
        editAction={renderEditAction}
        removeAction={renderRemoveAction}
        loading={loading}
        onClick={onClick}
        queryParams={queryParams}
        treeView={
          !['disabled', 'archived'].includes(
            router.getParam(location, ['status'])
          )
        }
        keyCount="productCount"
      />
    );
  };

  const renderCategoryHeader = () => {
    const trigger = (
      <Button btnStyle="success" icon="plus-circle" block={true}>
        Add category
      </Button>
    );

    return <Header>{renderFormTrigger(trigger)}</Header>;
  };

  return (
    <Sidebar hasBorder={true}>
      {renderCategoryHeader()}
      <SidebarList>{renderContent()}</SidebarList>
      <CategoryStatusFilter />
    </Sidebar>
  );
};

export default AccountCategoryList;

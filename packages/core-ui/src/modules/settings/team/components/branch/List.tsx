import React from 'react';
import BlockList from '../common/BlockList';
import Form from '../../containers/branch/Form';
import { Alert, confirm } from '@erxes/ui/src/utils';
import { gql, useMutation } from '@apollo/client';
import { mutations } from '@erxes/ui/src/team/graphql';
import { Button, Tip, Icon } from '@erxes/ui/src/components';
import { IBranch } from '@erxes/ui/src/team/types';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';

type Props = {
  listQuery: any;
  queryType: string;
  title: string;
  queryParams: string;
  branch?: IBranch;
};

export default function List(props: Props) {
  const { queryType, listQuery, title, queryParams, branch } = props;
  const allItems = listQuery.data[queryType] || [];

  const trigger = (
    <Button btnStyle="link">
      <Tip text={'Edit'} placement="bottom">
        <Icon icon="edit" />
      </Tip>
    </Button>
  );

  const renderForm = ({ closeModal }) => {
    console.log(branch);
    return (
      <Form
        branch={branch}
        closeModal={closeModal}
        additionalRefetchQueries={['users']}
        queryType={queryType}
      />
    );
  };

  const editAction = () => (
    <ModalTrigger
      content={({ closeModal }) => renderForm({ closeModal })}
      title={`Edit ${title}`}
      trigger={trigger}
    />
  );

  const [deleteMutation] = useMutation(gql(mutations.branchesRemove));

  const deleteItem = (_id: string, callback: () => void) => {
    confirm().then(() => {
      deleteMutation({ variables: { ids: [_id] } })
        .then(() => {
          callback();
          Alert.success('Successfully deleted');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  const renderRemoveAction = branch => {
    return (
      <Button
        btnStyle="link"
        onClick={() => deleteItem(branch._id, listQuery.refetch)}
      >
        <Tip text={'Remove'} placement="bottom">
          <Icon icon="cancel-1" />
        </Tip>
      </Button>
    );
  };

  return (
    <BlockList
      allDatas={allItems}
      renderForm={renderForm}
      title={title}
      queryParams={queryParams}
      queryType={queryType}
      removeAction={renderRemoveAction}
      editAction={editAction}
    />
  );
}

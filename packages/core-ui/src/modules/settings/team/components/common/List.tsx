import React from 'react';
import BlockList from './BlockList';
import Form from '../../containers/common/Form';
import { Alert, confirm } from '@erxes/ui/src/utils';
import { Button, Tip, Icon } from '@erxes/ui/src/components';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';

type Props = {
  listQuery: any;
  queryType: string;
  title: string;
  queryParams: string;
  deleteMutation: any;
};

export default function List(props: Props) {
  const { queryType, listQuery, title, queryParams, deleteMutation } = props;
  const allItems = listQuery.data[queryType] || [];

  const renderForm = ({
    closeModal,
    item
  }: {
    closeModal: () => void;
    item?: string;
  }): React.ReactNode => {
    return <Form item={item} closeModal={closeModal} queryType={queryType} />;
  };

  const trigger = (
    <Button btnStyle="link">
      <Tip text={'Edit'} placement="bottom">
        <Icon icon="edit" />
      </Tip>
    </Button>
  );

  const editAction = item => (
    <ModalTrigger
      content={({ closeModal }) => renderForm({ closeModal, item })}
      title={`Edit ${title}`}
      trigger={trigger}
    />
  );

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

  const renderRemoveAction = item => {
    return (
      <Button
        btnStyle="link"
        onClick={() => deleteItem(item._id, listQuery.refetch)}
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

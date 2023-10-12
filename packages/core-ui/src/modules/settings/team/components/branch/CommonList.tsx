import React from 'react';
import { Button, Tip, Icon } from '@erxes/ui/src/components';
import { gql, useMutation } from '@apollo/client';
import { __ } from 'modules/common/utils';
import BlockList from '../common/BlockList';
import { Alert, confirm } from '@erxes/ui/src/utils';

interface Item {
  _id: string;
}

interface CommonListProps<T> {
  listQuery: any;
  title: string;
  removeMutation: string;
  FormComponent: React.ComponentType<{ data?: Item; closeModal: () => void }>;
  dataKey: string;
  renderFormTrigger;
}

const CommonList = <T extends Item>({
  listQuery,
  title,
  removeMutation,
  FormComponent,
  dataKey,
  renderFormTrigger
}: CommonListProps<T>) => {
  const allItems = listQuery.data[dataKey] || [];

  const renderForm = ({ closeModal }) => {
    return <FormComponent closeModal={closeModal} />;
  };

  const renderEditAction = (item: T) => {
    const trigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return renderFormTrigger(trigger, item);
  };

  const [deleteMutation] = useMutation(gql(removeMutation));

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

  const renderRemoveAction = (item: T) => {
    return (
      <Button
        btnStyle="link"
        onClick={() => deleteItem(item._id, listQuery.refetch)}
      >
        <Tip text={__('Remove')} placement="bottom">
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
      renderEditAction={renderEditAction}
      renderRemoveAction={renderRemoveAction}
    />
  );
};

export default CommonList;

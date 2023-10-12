import React from 'react';
import { ModalTrigger, Button, Tip, Icon } from '@erxes/ui/src/components';
import { gql, useMutation } from '@apollo/client';
import { __ } from 'modules/common/utils';
import BlockList from '../common/BlockList';
import { Alert, confirm } from '@erxes/ui/src/utils';

interface Item {
  _id: string;
}

interface CommonListProps<T extends Item> {
  listQuery: any;
  title: string;
  removeMutation: string;
  FormComponent: React.FC<{ closeModal: () => void; data?: T }>;
  dataKey: string;
}

const CommonList = <T extends Item>({
  listQuery,
  title,
  removeMutation,
  FormComponent,
  dataKey
}: CommonListProps<T>) => {
  const allItems = listQuery.data[dataKey] || [];

  const renderForm = ({ closeModal }) => {
    return <FormComponent closeModal={closeModal} />;
  };

  const renderFormTrigger = (trigger: React.ReactNode, items?: T) => {
    const content = ({ closeModal }) => (
      <FormComponent data={items} closeModal={closeModal} />
    );

    return (
      <ModalTrigger
        title={`Edit a ${title}`}
        trigger={trigger}
        content={content}
      />
    );
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

  //   return null;

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

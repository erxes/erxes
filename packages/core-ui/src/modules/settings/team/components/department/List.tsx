import React from 'react';

import Form from '../../containers/department/Form';
import BlockList from '../common/BlockList';
import Icon from '@erxes/ui/src/components/Icon';
import { __ } from 'modules/common/utils';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tip from '@erxes/ui/src/components/Tip';
import Button from '@erxes/ui/src/components/Button';
import { IDepartment } from '@erxes/ui/src/team/types';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client';
import { mutations } from '@erxes/ui/src/team/graphql';
import { Alert, confirm } from '@erxes/ui/src/utils';

type Props = {
  listQuery: any;
};

export default function List({ listQuery }: Props) {
  const allDepartments = listQuery.data.departments || [];

  const renderForm = ({ closeModal }) => {
    return <Form closeModal={closeModal} />;
  };

  const renderFormTrigger = (
    trigger: React.ReactNode,
    department?: IDepartment
  ) => {
    const content = ({ closeModal }) => (
      <Form department={department} closeModal={closeModal} />
    );

    return (
      <ModalTrigger title={`Edit a Unit`} trigger={trigger} content={content} />
    );
  };

  const renderEditAction = (department: IDepartment) => {
    const trigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return renderFormTrigger(trigger, department);
  };

  const [deleteMutation] = useMutation(gql(mutations.departmentsRemove));

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

  const renderRemoveAction = (department: IDepartment) => {
    if (!deleteItem) {
      return null;
    }

    return (
      <Button
        btnStyle="link"
        onClick={() => deleteItem(department._id, listQuery.refetch)}
      >
        <Tip text={__('Remove')} placement="bottom">
          <Icon icon="cancel-1" />
        </Tip>
      </Button>
    );
  };

  return null;

  // return (
  //   <BlockList
  //     allDatas={allDepartments}
  //     renderForm={renderForm}
  //     title="Department"
  //     renderEditAction={renderEditAction}
  //     renderRemoveAction={renderRemoveAction}
  //   />
  // );
}

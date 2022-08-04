import React from 'react';

import Form from '../../containers/branch/Form';
import { IBranch } from '../../types';
import BlockItem from '../common/Item';

type Props = {
  branch: IBranch;
  deleteBranch: (_id: string, callback: () => void) => void;
  refetch: () => void;
  level?: number;
};

export default function Item({ branch, refetch, deleteBranch, level }: Props) {
  const renderForm = ({ closeModal }) => {
    return <Form branch={branch} closeModal={closeModal} />;
  };

  return (
    <BlockItem
      item={branch}
      level={level}
      title="branch"
      icon={level && level > 0 ? 'arrows-up-right' : 'gold'}
      renderForm={renderForm}
      deleteItem={deleteBranch}
      refetch={refetch}
      queryParamName="branchId"
    />
  );
}

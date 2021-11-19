import React from 'react';

import Form from '../../containers/branch/Form';
import { IBranch } from '../../types';
import BlockItem from '../common/Item';

type Props = {
  branch: IBranch;
  deleteBranch: (_id: string, callback: () => void) => void;
  refetch: () => void;
  isChild?: boolean;
};

export default function Item({
  branch,
  isChild,
  refetch,
  deleteBranch
}: Props) {
  const renderForm = ({ closeModal }) => {
    return <Form branch={branch} closeModal={closeModal} />;
  };

  return (
    <BlockItem
      item={branch}
      title="branch"
      icon={isChild ? 'arrows-up-right' : 'gold'}
      isChild={isChild}
      renderForm={renderForm}
      deleteItem={deleteBranch}
      refetch={refetch}
      queryParamName="branchId"
    />
  );
}

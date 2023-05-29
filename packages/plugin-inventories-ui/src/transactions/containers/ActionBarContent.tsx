import React from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
// erxes
import { Alert } from '@erxes/ui/src/utils';
// local
import { mutations } from '../graphql';
import ActionBarContentComponent from '../components/ActionBarContent';

type Props = {
  data: any;
};

const ActionBarContentContainer = () => {
  // Hooks
  const [transactionAdd] = useMutation(gql(mutations.transactionAdd));

  const submit = (
    departmentId: string,
    branchId: string,
    products: any,
    closeModal: any
  ) => {
    transactionAdd({
      variables: {
        departmentId: departmentId,
        branchId: branchId,
        contentType: 'Transaction Page',
        contentId: 'transaction_page_id',
        products: products
      }
    })
      .then(() => {
        closeModal();
        window.location.reload();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  return <ActionBarContentComponent submit={submit} />;
};

export default compose()(ActionBarContentContainer);

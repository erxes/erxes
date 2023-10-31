import * as compose from 'lodash.flowright';

import { mutations, queries } from '../graphql';

import { Alert } from '@erxes/ui/src/utils';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import ShareForm from '../components/ShareForm';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';

type Props = {
  item: any;
  closeModal: () => void;
};

type FinalProps = {
  unitsQuery: any;
  shareMutation: any;
} & Props &
  IRouterProps;

const ShareFormContainer = (props: FinalProps) => {
  const { unitsQuery, shareMutation, closeModal } = props;

  if (unitsQuery && unitsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const units = unitsQuery ? unitsQuery.units : ([] as any);

  const shareFile = variables => {
    shareMutation({
      variables
    })
      .then(() => {
        Alert.success('You successfully shared');

        closeModal();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const extendedProps = {
    ...props,
    units,
    shareFile
  };

  return <ShareForm {...extendedProps} />;
};

export default compose(
  graphql<Props>(gql(queries.units), {
    name: 'unitsQuery'
  }),
  graphql<Props>(gql(mutations.filemanagerChangePermission), {
    name: 'shareMutation',
    options: ({ item }: { item: any }) => {
      return {
        refetchQueries: [
          {
            query: gql(queries.filemanagerLogs),
            variables: {
              contentTypeId: item._id
            }
          }
        ]
      };
    }
  })
)(ShareFormContainer);

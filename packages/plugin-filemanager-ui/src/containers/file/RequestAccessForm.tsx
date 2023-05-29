import * as compose from 'lodash.flowright';

import { mutations, queries } from '../../graphql';

import { Alert } from '@erxes/ui/src/utils';
import React from 'react';
import RequestAccessForm from '../../components/file/RequestAccessForm';
import { RequestAccessMutationResponse } from '../../types';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';

type Props = {
  fileId: string;
};

type FinalProps = {} & Props & RequestAccessMutationResponse;

const RequestAccessFormContainer = ({
  requestAccessMutation,
  fileId
}: FinalProps) => {
  const onRequest = (variables, callback) => {
    requestAccessMutation({
      variables
    })
      .then(() => {
        Alert.success('You request submitted!');

        if (callback) {
          callback();
        }
      })
      .catch(error => {
        Alert.error(error.message);

        if (callback) {
          callback();
        }
      });
  };

  return <RequestAccessForm requestAccess={onRequest} fileId={fileId} />;
};

export default compose(
  graphql<Props, RequestAccessMutationResponse, {}>(
    gql(mutations.filemanagerRequestAccess),
    {
      name: 'requestAccessMutation'
    }
  )
)(RequestAccessFormContainer);

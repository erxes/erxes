import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert } from '../../common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import InitialSetup from '../components/InitialSetup';
import { mutations } from '../graphql';
import { FetchConfigsMutationResponse } from '../types';

type Props = {};

type FinalProps = Props & FetchConfigsMutationResponse;

const InitialSetupContainer = (props: FinalProps) => {
  const { fetchConfigsMutation } = props;

  const fetchConfigs = (token: string) => {
    fetchConfigsMutation({ variables: { token } })
      .then(() => {
        window.location.reload();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  return <InitialSetup fetchConfigs={fetchConfigs} />;
};

export default compose(
  graphql<Props, FetchConfigsMutationResponse>(gql(mutations.configsFetch), {
    name: 'fetchConfigsMutation'
  })
)(InitialSetupContainer);

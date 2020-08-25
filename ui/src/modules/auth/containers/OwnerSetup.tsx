import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import OwnerSetup from '../components/OwnerSetup';
import { mutations } from '../graphql';

type Props = {
  createOwnerMutation: any;
};

const OwnerSetupContainer = (props: Props) => {
  const { createOwnerMutation } = props;

  const createOwner = doc => {
    createOwnerMutation({
      variables: doc
    })
      .then(() => {
        window.location.reload();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  return <OwnerSetup createOwner={createOwner} />;
};

export default compose(
  graphql(gql(mutations.createOwner), {
    name: 'createOwnerMutation'
  })
)(OwnerSetupContainer);

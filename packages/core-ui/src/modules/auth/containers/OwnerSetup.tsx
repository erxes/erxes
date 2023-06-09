import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { Alert } from 'modules/common/utils';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import OwnerSetup from '../components/OwnerSetup';
import { mutations } from '../graphql';
import { CreateOwnerMutationResponse, IOwner } from '../types';

type Props = {};

type FinalProps = Props & CreateOwnerMutationResponse;

const OwnerSetupContainer = (props: FinalProps) => {
  const { createOwnerMutation } = props;

  const createOwner = (doc: IOwner) => {
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
  graphql<Props, CreateOwnerMutationResponse, IOwner>(
    gql(mutations.createOwner),
    {
      name: 'createOwnerMutation'
    }
  )
)(OwnerSetupContainer);

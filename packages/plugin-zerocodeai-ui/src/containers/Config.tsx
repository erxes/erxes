import * as compose from 'lodash.flowright';

import { Alert, withProps } from '@erxes/ui/src/utils';
import { queries, mutations } from '../graphql';

import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import DumpConfig from '../components/Config';

type Props = {
  configQuery;
  saveConfigMutation;
};

const Config = (props: Props) => {
  const { configQuery, saveConfigMutation } = props;

  if (configQuery.loading) {
    return <Spinner />;
  }

  const config = configQuery.zerocodeaiGetConfig || [];

  const save = variables => {
    saveConfigMutation({ variables })
      .then(() => {
        Alert.success('Successfully saved');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    save,
    config
  };

  return <DumpConfig {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.getConfig), {
      name: 'configQuery'
    }),
    graphql<Props>(gql(mutations.saveConfig), {
      name: 'saveConfigMutation'
    })
  )(Config)
);

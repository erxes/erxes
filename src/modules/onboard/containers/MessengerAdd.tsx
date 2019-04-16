import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { BrandsQueryResponse } from 'modules/settings/brands/types';
import {
  mutations,
  queries as integrationQuery
} from 'modules/settings/integrations/graphql';
import {
  IntegrationsCountQueryResponse,
  SaveMessengerMutationResponse,
  SaveMessengerMutationVariables
} from 'modules/settings/integrations/types';
import * as React from 'react';
import { ChildProps, compose, graphql } from 'react-apollo';
import { MessengerAdd } from '../components';
import { OnboardConsumer } from '../containers/OnboardContext';
import { queries } from '../graphql';

type Props = {
  brandsQuery: BrandsQueryResponse;
  totalCountQuery: IntegrationsCountQueryResponse;
  changeStep: (increase: boolean) => void;
} & SaveMessengerMutationResponse;

const MessengerAddContainer = (props: ChildProps<Props>) => {
  const { brandsQuery, saveMessengerMutation, totalCountQuery } = props;

  let totalCount = 0;

  if (!totalCountQuery.loading) {
    totalCount = totalCountQuery.integrationsTotalCount.byKind.messenger;
  }

  const brands = brandsQuery.brands || [];

  const save = (doc, callback: () => void) => {
    const { brandId, languageCode } = doc;

    if (!languageCode) {
      return Alert.error('Set language');
    }

    if (!brandId) {
      return Alert.error('Choose a brand');
    }

    saveMessengerMutation({
      variables: doc
    })
      .then(() => {
        Alert.success('You successfully saved an app');
        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    brands,
    save,
    totalCount
  };

  return <MessengerAdd {...updatedProps} />;
};

const WithQuery = compose(
  graphql<SaveMessengerMutationResponse, SaveMessengerMutationVariables>(
    gql(mutations.integrationsCreateMessenger),
    {
      name: 'saveMessengerMutation',
      options: () => {
        return {
          refetchQueries: [
            {
              query: gql(queries.integrations),
              variables: {
                kind: 'messenger'
              }
            },
            {
              query: gql(integrationQuery.integrationTotalCount)
            }
          ]
        };
      }
    }
  ),
  graphql<BrandsQueryResponse>(gql(integrationQuery.brands), {
    name: 'brandsQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(integrationQuery.integrationTotalCount), {
    name: 'totalCountQuery'
  })
)(MessengerAddContainer);

export default () => (
  <OnboardConsumer>
    {({ changeStep }) => <WithQuery changeStep={changeStep} />}
  </OnboardConsumer>
);

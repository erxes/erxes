import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from 'erxes-ui';
import React from 'react';
import { graphql } from 'react-apollo';
import { IRouterProps } from 'erxes-ui/lib/types';
import { queries, mutations } from '../../graphql';
import {
  EditIntegrationMutationResponse,
  IntegrationDetailQueryResponse,
  IntegrationMutationVariables,
  PosConfigQueryResponse
} from '../../types';
import Pos from '../components/Pos';

type Props = {
  integrationId: string;
  queryParams: any;
};

type State = {
  isLoading: boolean;
  isReadyToSaveForm: boolean;
  doc?: {
    brandId: string;
    name: string;
  };
};

type FinalProps = {
  integrationDetailQuery: IntegrationDetailQueryResponse;
  configQuery: PosConfigQueryResponse;
} & Props &
  EditIntegrationMutationResponse &
  IRouterProps;

class EditPosContainer extends React.Component<FinalProps, State> {
  constructor(props: FinalProps) {
    super(props);

    this.state = { isLoading: false, isReadyToSaveForm: false };
  }

  render() {
    console.log('props: ',this.props)

    const {
      formId,
      integrationDetailQuery,
      editIntegrationMutation,
      history
    } = this.props;

    if (integrationDetailQuery.loading) {
      return false;
    }

    const integration = integrationDetailQuery.integrationDetail || {};

    const afterFormDbSave = () => {
      if (this.state.doc) {
        const {
          leadData,
          brandId,
          name,
          languageCode,
          channelIds
        } = this.state.doc;

        editIntegrationMutation({
          variables: {
            _id: integration._id,
            formId,
            leadData,
            brandId,
            name,
            languageCode,
            channelIds
          }
        })
          .then(() => {
            Alert.success('You successfully updated a form');

            history.push({
              pathname: '/pos',
              search: '?refetchList=true'
            });
          })

          .catch(error => {
            Alert.error(error.message);

            this.setState({ isReadyToSaveForm: false, isLoading: false });
          });
      }
    };

    const save = doc => {
      this.setState({ isLoading: true, isReadyToSaveForm: true, doc });
    };

    const updatedProps = {
      ...this.props,
      integration,
      save,
      afterFormDbSave,
      isActionLoading: this.state.isLoading,
      isReadyToSaveForm: this.state.isReadyToSaveForm
    };

    return <Pos {...updatedProps} />;
  }
}

export default withProps<FinalProps>(
  compose(
    graphql<Props, IntegrationDetailQueryResponse, { _id: string }>(
      gql(queries.integrationDetail),
      {
        name: 'integrationDetailQuery',
        options: ({ integrationId }) => ({
          fetchPolicy: 'cache-and-network',
          variables: {
            _id: integrationId
          }
        })
      }
    ),

    graphql<Props, PosConfigQueryResponse, { integrationId: string }>(
      gql(queries.posConfig),
      {
        name: 'configQuery',
        options: ({ integrationId }) => ({
          fetchPolicy: 'cache-and-network',
          variables: {
            integrationId
          }
        })
      }
    ),

    // graphql<Props,EditIntegrationMutationResponse,IntegrationMutationVariables>(
    //   gql(mutations.integrationsEdit),
    //   {
    //     name: 'editIntegrationMutation',
    //     options: {
    //       refetchQueries: [
    //         'leadIntegrations',
    //         'leadIntegrationCounts',
    //         'formDetail'
    //       ]
    //     }
    //   }
    // )
  )(EditPosContainer)
);

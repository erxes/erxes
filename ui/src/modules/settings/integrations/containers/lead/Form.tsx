import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import Spinner from 'modules/common/components/Spinner';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import { __ } from 'modules/common/utils';
import { queries } from 'modules/settings/integrations/graphql';
import React from 'react';
import { graphql, withApollo } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import Lead from '../../components/lead/Lead';
import { mutations } from '../../graphql';
import { IntegrationsQueryResponse } from '../../types';
import { integrationsListParams } from '../utils';

type Props = {
  queryParams: any;
  closeModal: () => void;
};

type FinalProps = {
  integrationsQuery: IntegrationsQueryResponse;
  leadIntegrationsQuery: IntegrationsQueryResponse;
} & IRouterProps &
  Props;

class LeadContainer extends React.Component<FinalProps> {
  render() {
    const { integrationsQuery, leadIntegrationsQuery } = this.props;

    if (integrationsQuery.loading && leadIntegrationsQuery.loading) {
      return <Spinner objective={true} />;
    }

    const integrations = integrationsQuery.integrations || [];
    const leads = leadIntegrationsQuery.integrations || [];

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback
    }: IButtonMutateProps) => {
      return (
        <ButtonMutate
          mutation={mutations.messengerAppsAddLead}
          variables={values}
          callback={callback}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          uppercase={false}
          type="submit"
          successMessage={__(`You successfully added a`) + `${name}`}
        />
      );
    };

    const updatedProps = {
      ...this.props,
      integrations,
      leads,
      renderButton
    };

    return <Lead {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.messengerApps),
      variables: { kind: 'lead' }
    },
    {
      query: gql(queries.messengerAppsCount),
      variables: { kind: 'lead' }
    }
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props, IntegrationsQueryResponse>(gql(queries.integrations), {
      name: 'integrationsQuery',
      options: ({ queryParams }) => {
        return {
          notifyOnNetworkStatusChange: true,
          variables: {
            ...integrationsListParams(queryParams || {}),
            kind: 'messenger'
          },
          fetchPolicy: 'network-only'
        };
      }
    }),
    graphql<Props, IntegrationsQueryResponse>(gql(queries.integrations), {
      name: 'leadIntegrationsQuery',
      options: ({ queryParams }) => {
        return {
          notifyOnNetworkStatusChange: true,
          variables: {
            ...integrationsListParams(queryParams || {}),
            kind: 'lead'
          },
          fetchPolicy: 'network-only'
        };
      }
    }),
    withApollo
  )(withRouter<FinalProps>(LeadContainer))
);

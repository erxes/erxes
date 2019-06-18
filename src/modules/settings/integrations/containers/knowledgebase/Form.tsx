import gql from 'graphql-tag';
import { ButtonMutate, Spinner } from 'modules/common/components';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import { __, Alert, withProps } from 'modules/common/utils';
import { queries as kbQueries } from 'modules/knowledgeBase/graphql';
import { TopicsQueryResponse } from 'modules/knowledgeBase/types';
import { queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql, withApollo } from 'react-apollo';
import { withRouter } from 'react-router';
import { KnowledgeBase } from '../../components/knowledgebase';
import { mutations } from '../../graphql';
import { IntegrationsQueryResponse } from '../../types';
import { integrationsListParams } from '../utils';

type Props = {
  queryParams: any;
  closeModal: () => void;
};

type FinalProps = {
  integrationsQuery: IntegrationsQueryResponse;
  knowledgeBaseTopicsQuery: TopicsQueryResponse;
} & IRouterProps &
  Props;

class KnowledgeBaseContainer extends React.Component<FinalProps> {
  render() {
    const { integrationsQuery, knowledgeBaseTopicsQuery } = this.props;

    if (integrationsQuery.loading && knowledgeBaseTopicsQuery.loading) {
      return <Spinner objective={true} />;
    }

    const integrations = integrationsQuery.integrations || [];
    const topics = knowledgeBaseTopicsQuery.knowledgeBaseTopics || [];

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback
    }: IButtonMutateProps) => {
      return (
        <ButtonMutate
          mutation={mutations.messengerAppsAddKnowledgebase}
          variables={values}
          callback={callback}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          icon="checked-1"
          successMessage={`You successfully added a ${name}`}
        >
          {__('Save')}
        </ButtonMutate>
      );
    };

    const updatedProps = {
      ...this.props,
      integrations,
      topics,
      renderButton
    };

    return <KnowledgeBase {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.messengerApps),
      variables: { kind: 'knowledgebase' }
    },
    {
      query: gql(queries.messengerAppsCount),
      variables: { kind: 'knowledgebase' }
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
    graphql<Props, TopicsQueryResponse>(gql(kbQueries.knowledgeBaseTopics), {
      name: 'knowledgeBaseTopicsQuery'
    }),
    withApollo
  )(withRouter<FinalProps>(KnowledgeBaseContainer))
);

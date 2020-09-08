import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import Spinner from 'modules/common/components/Spinner';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import { __, withProps } from 'modules/common/utils';
import { queries as kbQueries } from 'modules/knowledgeBase/graphql';
import { TopicsQueryResponse } from 'modules/knowledgeBase/types';
import { queries } from 'modules/settings/integrations/graphql';
import React from 'react';
import { graphql, withApollo } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import KnowledgeBase from '../../components/knowledgebase/knowledgeBase';
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
      callback,
    }: IButtonMutateProps) => {
      return (
        <ButtonMutate
          mutation={mutations.messengerAppsAddKnowledgebase}
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
      topics,
      renderButton,
    };

    return <KnowledgeBase {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.messengerApps),
      variables: { kind: 'knowledgebase' },
    },
    {
      query: gql(queries.messengerAppsCount),
      variables: { kind: 'knowledgebase' },
    },
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
            kind: 'messenger',
          },
          fetchPolicy: 'network-only',
        };
      },
    }),
    graphql<Props, TopicsQueryResponse>(gql(kbQueries.knowledgeBaseTopics), {
      name: 'knowledgeBaseTopicsQuery',
    }),
    withApollo
  )(withRouter<FinalProps>(KnowledgeBaseContainer))
);

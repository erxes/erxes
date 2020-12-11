import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { queries } from '../../../integrations/graphql';
import Base from '../../components/scheduler/Base';

type Props = {
  accountId: string;
};

type FinalProps = {
  fetchApiQuery: any;
} & Props;

class BaseContainer extends React.Component<FinalProps, {}> {
  render() {
    const { fetchApiQuery, accountId } = this.props;

    if (fetchApiQuery.loading) {
      return <Spinner objective={true} />;
    }

    if (fetchApiQuery.error) {
      return (
        <span style={{ color: 'red' }}>Integrations api is not running</span>
      );
    }

    const refetchQueries = () => {
      getRefetchQueries(accountId);
    };

    const res = fetchApiQuery.integrationsFetchApi || {};

    const updatedProps = {
      pages: res.pages || [],
      accessToken: res.accessToken,
      name: res.name || '',
      refetchQueries
    };

    return <Base {...updatedProps} />;
  }
}

const getRefetchQueries = (accountId: string) => {
  return [
    {
      query: gql(queries.fetchApi),
      variables: { accountId }
    }
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props, any>(gql(queries.fetchApi), {
      name: 'fetchApiQuery',
      options: ({ accountId }) => {
        return {
          variables: {
            path: '/nylas/get-schedule-pages',
            params: {
              accountId
            }
          }
        };
      }
    })
  )(BaseContainer)
);

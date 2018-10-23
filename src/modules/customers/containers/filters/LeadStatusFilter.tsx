import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { LeadStatusFilter } from '../../components';
import { queries } from '../../graphql';
import { CountQueryResponse } from './BrandFilter';

type Props = {
  customersCountQuery: CountQueryResponse;
};

class LeadStatusFilterContainer extends React.Component<Props> {
  render() {
    const { customersCountQuery } = this.props;

    const counts = customersCountQuery.customerCounts || {};

    const updatedProps = {
      counts: counts.byLeadStatus || {},
      loading: customersCountQuery.loading
    };

    return <LeadStatusFilter {...updatedProps} />;
  }
}

export default withProps<{}>(
  compose(
    graphql<{}, CountQueryResponse, { only: string }>(
      gql(queries.customerCounts),
      {
        name: 'customersCountQuery',
        options: {
          variables: { only: 'byLeadStatus' }
        }
      }
    )
  )(LeadStatusFilterContainer)
);

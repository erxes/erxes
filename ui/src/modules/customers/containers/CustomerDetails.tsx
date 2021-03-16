import client from 'apolloClient';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import EmptyState from 'modules/common/components/EmptyState';
import Spinner from 'modules/common/components/Spinner';
import { withProps } from 'modules/common/utils';
import { queries as fieldQueries } from 'modules/settings/properties/graphql';
import { InboxFieldsQueryResponse } from 'modules/settings/properties/types';
import React from 'react';
import { graphql } from 'react-apollo';
import CustomerDetails from '../components/detail/CustomerDetails';
import { queries } from '../graphql';
import { CustomerDetailQueryResponse, ICustomer } from '../types';

type Props = {
  id: string;
};

type FinalProps = {
  customerDetailQuery: CustomerDetailQueryResponse;
  fieldsInboxQuery: InboxFieldsQueryResponse;
} & Props;

type State = {
  customer: ICustomer;
  loading: boolean;
};

class CustomerDetailsContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      customer: {} as ICustomer,
      loading: true
    };
  }

  componentDidMount() {
    const { id } = this.props;
    this.setState({ loading: true });

    client
      .query({
        query: gql(queries.customerDetail),
        fetchPolicy: 'network-only',
        variables: { _id: id }
      })
      .then(({ data }: { data: any }) => {
        if (data && data.customerDetail) {
          this.setState({ customer: data.customerDetail, loading: false });
        }
      })
      .catch(error => {
        console.log(error.message); // tslint:disable-line
      });

    return;
  }

  render() {
    const { id, fieldsInboxQuery } = this.props;
    const { loading, customer } = this.state;

    if (loading) {
      return <Spinner objective={true} />;
    }

    if (!customer) {
      return (
        <EmptyState text="Customer not found" image="/images/actions/17.svg" />
      );
    }

    if (fieldsInboxQuery.loading) {
      return <Spinner />;
    }

    const fields = fieldsInboxQuery.fieldsInbox;

    const taggerRefetchQueries = [
      {
        query: gql(queries.customerDetail),
        variables: { _id: id }
      }
    ];

    const updatedProps = {
      ...this.props,
      customer: this.state.customer,
      taggerRefetchQueries,
      fields: fields.customer,
      deviceFields: fields.device
    };

    return <CustomerDetails {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, InboxFieldsQueryResponse>(gql(fieldQueries.inboxFields), {
      name: 'fieldsInboxQuery'
    })
  )(CustomerDetailsContainer)
);

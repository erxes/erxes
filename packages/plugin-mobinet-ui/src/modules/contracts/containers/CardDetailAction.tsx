import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import client from '@erxes/ui/src/apolloClient';
import Button from '@erxes/ui/src/components/Button';
import gql from 'graphql-tag';
import React from 'react';
import { queries, mutations } from '../graphql';

type Props = {
  item: any;
  getByTicket: any;
};

type State = {
  loading: boolean;
};

class Container extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { loading: false };
  }

  convert = () => {
    this.setState({ loading: true });

    const { item, getByTicket } = this.props;

    client
      .mutate({
        mutation: gql(mutations.contractsCreate),
        variables: { ticketId: item._id }
      })
      .then(() => {
        getByTicket.refetch();
        this.setState({ loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };

  render() {
    const { item, getByTicket } = this.props;

    if (!item.name.includes('Contract request')) {
      return null;
    }

    if (getByTicket.mobiContractsGetByTicket) {
      return (
        <Button size="small" disabled={true}>
          Converted to contract
        </Button>
      );
    }

    return (
      <Button size="small" onClick={this.convert}>
        Convert to contract
      </Button>
    );
  }
}

export default compose(
  graphql(gql(queries.getByTicket), {
    name: 'getByTicket',
    options: ({ item }: any) => ({
      variables: { ticketId: item._id }
    })
  })
)(Container);

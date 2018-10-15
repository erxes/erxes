import gql from 'graphql-tag';
import { __, Alert } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Deals } from '../components/portable';
import { mutations, queries } from '../graphql';
import { IDeal, IDealParams, SaveDealMutation } from '../types';

type Props = {
  deals: IDeal[];
  addMutation: SaveDealMutation;
  dealsQuery: any;
};

class PortableDealsContainer extends React.Component<Props> {
  saveDeal = (doc: IDealParams, callback: () => void) => {
    const { addMutation, dealsQuery } = this.props;

    addMutation({ variables: doc })
      .then(() => {
        Alert.success(__('Successfully saved.'));

        callback();

        dealsQuery.refetch();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  onChangeDeals = () => {
    const { dealsQuery } = this.props;

    dealsQuery.refetch();
  };

  render() {
    const { dealsQuery = {} } = this.props;

    const deals = dealsQuery.deals || [];

    const extendedProps = {
      ...this.props,
      deals,
      saveDeal: this.saveDeal,
      onChangeDeals: this.onChangeDeals
    };

    return <Deals {...extendedProps} />;
  }
}

export default compose(
  // mutation
  graphql(gql(mutations.dealsAdd), {
    name: 'addMutation'
  }),
  graphql(gql(queries.deals), {
    name: 'dealsQuery',
    skip: ({ customerId, companyId }) => !customerId && !companyId,
    options: ({
      customerId,
      companyId
    }: {
      customerId: string;
      companyId: string;
    }) => ({
      variables: {
        customerId,
        companyId
      }
    })
  })
)(PortableDealsContainer);

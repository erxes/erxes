import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Deals } from '../components/portable';
import { mutations, queries } from '../graphql';
import { DealsQueryResponse, IDealParams, SaveDealMutation } from '../types';

type Props = {
  customerIds?: string[];
  companyIds?: string[];
  isOpen?: boolean;
};

type FinalProps = {
  addMutation: SaveDealMutation;
  dealsQuery: DealsQueryResponse;
} & Props;

class PortableDealsContainer extends React.Component<FinalProps> {
  saveDeal = (doc: IDealParams, callback: () => void) => {
    const { addMutation, dealsQuery } = this.props;

    addMutation({ variables: doc })
      .then(() => {
        Alert.success('You successfully added a deal');

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
    const { dealsQuery } = this.props;
    if (!dealsQuery) {
      return null;
    }

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

export default withProps<Props>(
  compose(
    // mutation
    graphql<{}, SaveDealMutation, IDealParams>(gql(mutations.dealsAdd), {
      name: 'addMutation'
    }),
    graphql<
      Props,
      DealsQueryResponse,
      { customerIds?: string[]; companyIds?: string[] }
    >(gql(queries.deals), {
      name: 'dealsQuery',
      skip: ({ customerIds, companyIds }) => !customerIds && !companyIds,
      options: ({ customerIds, companyIds }) => ({
        variables: {
          customerIds,
          companyIds
        }
      })
    })
  )(PortableDealsContainer)
);

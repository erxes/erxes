import gql from 'graphql-tag';
import { __, Alert } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Stage } from '../components';
import { mutations, queries } from '../graphql';
import { ICommonParams, IDeal, IDealParams } from '../types';
import { collectOrders, saveDeal as save } from '../utils';

type Order = {
  _id: string;
  order: number;
}

interface IProps {
  deals: IDeal[];
  addMutation: (params: { variables: IDealParams }) => Promise<any>;
  dealsUpdateOrderMutation: (params: { variables: { orders: Order[] } }) => Promise<any>;
  dealsChangeMutation: (params: { variables: { _id: string, stageId: string } }) => Promise<any>;
  dealsUpdateOrder: any;
  stageDetailQuery: any;
  dealsQuery: any;
};

class StageContainer extends React.Component<IProps & IWrapperProps, { deals: ICommonParams[] }> {
  constructor(props) {
    super(props);

    const { deals } = props;

    this.state = { deals };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.state !== nextProps.state) {
      const {
        state: { type, index, itemId },
        stageId,
        stageDetailQuery,
        dealsChangeMutation,
        dealsUpdateOrderMutation
      } = nextProps;

      const { deals } = this.state;

      if (type === 'removeItem') {
        // Remove from list
        deals.splice(index, 1);
      }

      if (type === 'addItem') {
        // Add to list
        deals.splice(index, 0, { _id: itemId });

        // if move to other stage, will change stageId
        dealsChangeMutation({
          variables: { _id: itemId, stageId }
        }).catch(error => {
          Alert.error(error.message);
        });
      }

      const orders = collectOrders(deals);

      dealsUpdateOrderMutation({
        variables: { orders }
      })
        .then(() => {
          stageDetailQuery.refetch();
        })
        .catch(error => {
          Alert.error(error.message);
        });

      this.setState({ deals });
    }
  }

  render() {
    const { stageId, stageDetailQuery, addMutation } = this.props;

    // create deal
    const addDeal = (name: string, callback) => {
      addMutation({ variables: { name, stageId } })
        .then(() => {
          Alert.success(__('Successfully saved.'));

          callback();
        })
        .catch(error => {
          Alert.error(error.message);
        });
    }

    const extendedProps = {
      ...this.props,
      deals: this.state.deals,
      addDeal,
      stage: stageDetailQuery.dealStageDetail || {}
    };

    return <Stage {...extendedProps} />;
  }
}

const StageContainerWithData = compose(
  // mutation
  graphql(gql(mutations.dealsAdd), {
    name: 'addMutation',
    options: ({ stageId }: { stageId: string}) => ({
      refetchQueries: [{
        query: gql(queries.deals),
        variables: { stageId }
      }]
    }),
  }),
  graphql(gql(queries.stageDetail), {
    name: 'stageDetailQuery',
    options: ({ stageId }: { stageId: string }) => ({
      variables: {
        _id: stageId
      }
    })
  }),
  graphql(gql(mutations.dealsUpdateOrder), {
    name: 'dealsUpdateOrderMutation'
  }),
  graphql(gql(mutations.dealsChange), {
    name: 'dealsChangeMutation'
  })
)(StageContainer);

class StageWithDeals extends React.Component<{ dealsQuery: any } & IWrapperProps> {
  render() {
    const { dealsQuery } = this.props;

    if (dealsQuery.loading) {
      return null;
    }

    const deals = dealsQuery.deals || [];

    const extendedProps = {
      ...this.props,
      deals
    };

    return <StageContainerWithData {...extendedProps} />;
  }
}

interface IWrapperProps {
  state: { deals: ICommonParams[] };
  stageId: string;
  index: number;
};

export default compose(
  graphql(gql(queries.deals), {
    name: 'dealsQuery',
    options: ({ stageId }: { stageId: string }) => ({
      variables: {
        stageId
      }
    })
  })
)(StageWithDeals);
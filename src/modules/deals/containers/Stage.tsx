import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Stage } from '../components';
import { mutations, queries } from '../graphql';
import { ICommonParams, IDeal, IDealParams } from '../types';
import {
  collectOrders,
  removeDeal as remove,
  saveDeal as save
} from '../utils';

type Order = {
  _id: string;
  order: number;
};

type Props = {
  state: { deals: ICommonParams[] };
  stageId: string;
  deals: IDeal[];
  addMutation: (params: { variables: { doc: IDealParams } }) => Promise<void>;
  editMutation: (params: { variables: { doc: IDealParams } }) => Promise<void>;
  removeMutation: (params: { variables: { _id: string } }) => Promise<void>;
  dealsUpdateOrderMutation: (
    params: { variables: { orders: Order[] } }
  ) => Promise<void>;
  dealsChangeMutation: (
    params: { variables: { _id: string; stageId: string } }
  ) => Promise<void>;
  dealsUpdateOrder: any;
  stageDetailQuery: any;
  dealsQuery: any;
};

class StageContainer extends React.Component<
  Props,
  { deals: ICommonParams[] }
> {
  constructor(props) {
    super(props);

    this.saveDeal = this.saveDeal.bind(this);
    this.removeDeal = this.removeDeal.bind(this);

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

  // create or update deal
  saveDeal(doc: IDealParams, callback: () => void, deal?: IDeal) {
    const {
      stageDetailQuery,
      addMutation,
      editMutation,
      dealsQuery
    } = this.props;

    const { deals } = this.state;

    save(
      doc,
      { addMutation, editMutation, dealsQuery },
      data => {
        // if edit mode
        if (deal) {
          const index = deals.findIndex(d => d._id === data.dealsEdit._id);

          deals[index] = data.dealsEdit;
        } else {
          deals.push(data.dealsAdd);
        }

        this.setState({ deals });

        stageDetailQuery.refetch();

        callback();
      },
      deal
    );
  }

  // remove deal
  removeDeal(_id: string) {
    const { stageDetailQuery, removeMutation, dealsQuery } = this.props;
    const { deals } = this.state;

    remove(_id, { removeMutation, dealsQuery }, dealsRemove => {
      this.setState({
        deals: deals.filter(el => el._id !== dealsRemove._id)
      });

      stageDetailQuery.refetch();
    });
  }

  render() {
    const { stageDetailQuery } = this.props;

    const extendedProps = {
      ...this.props,
      deals: this.state.deals,
      saveDeal: this.saveDeal,
      removeDeal: this.removeDeal,
      stage: stageDetailQuery.dealStageDetail || {}
    };

    return <Stage {...extendedProps} />;
  }
}

const StageContainerWithData = compose(
  // mutation
  graphql(gql(mutations.dealsAdd), {
    name: 'addMutation'
  }),
  graphql(gql(mutations.dealsEdit), {
    name: 'editMutation'
  }),
  graphql(gql(mutations.dealsRemove), {
    name: 'removeMutation'
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

class StageWithDeals extends React.Component<{ dealsQuery: any }> {
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

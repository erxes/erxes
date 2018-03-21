import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Stage } from '../components';
import { queries, mutations } from '../graphql';
import { Alert, confirm } from 'modules/common/utils';
import { Spinner } from 'modules/common/components';
import { collectOrders } from '../utils';

class StageContainer extends React.Component {
  constructor(props) {
    super(props);

    this.saveDeal = this.saveDeal.bind(this);
    this.removeDeal = this.removeDeal.bind(this);
    this.moveDeal = this.moveDeal.bind(this);

    const { dealsFromDb } = props;

    this.state = {
      deals: [...dealsFromDb]
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.state !== nextProps.state) {
      const {
        state: { type, index, itemId },
        stageId,
        dealsUpdateOrder,
        dealsChange,
        stageDetailQuery
      } = nextProps;
      const deals = this.state.deals;

      if (type === 'removeItem') {
        // Remove from list
        deals.splice(index, 1);

        dealsUpdateOrder(collectOrders(deals), () => {
          stageDetailQuery.refetch();
        });
      }

      if (type === 'addItem') {
        // Add to list
        deals.splice(index, 0, { _id: itemId });

        dealsUpdateOrder(collectOrders(deals), () => {
          stageDetailQuery.refetch();
        });

        dealsChange(itemId, stageId);
      }

      this.setState({ deals });
    }
  }

  // create or update deal
  saveDeal(doc, callback, deal) {
    const { addMutation, editMutation, stageDetailQuery } = this.props;

    const deals = this.state.deals;

    let mutation = addMutation;

    // if edit mode
    if (deal) {
      mutation = editMutation;
      doc._id = deal._id;
    }

    mutation({
      variables: doc
    })
      .then(({ data }) => {
        Alert.success('Successfully saved!');

        if (deal) {
          const index = deals.findIndex(d => d._id === data.dealsEdit._id);

          deals[index] = data.dealsEdit;
        } else {
          deals.push(data.dealsAdd);
        }

        this.setState({
          deals
        });

        stageDetailQuery.refetch();

        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  }

  // remove deal
  removeDeal(_id) {
    const { removeMutation, stageDetailQuery } = this.props;
    const deals = this.state.deals;

    confirm().then(() => {
      removeMutation({
        variables: { _id }
      })
        .then(({ data: { dealsRemove } }) => {
          Alert.success('Successfully deleted.');

          this.setState({
            deals: deals.filter(el => el._id !== dealsRemove._id)
          });

          stageDetailQuery.refetch();
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  }

  // move deal
  moveDeal(doc) {
    const { dealsChangeMutation, stageDetailQuery } = this.props;

    dealsChangeMutation({
      variables: doc
    })
      .then(() => {
        Alert.success('Successfully moved.');

        stageDetailQuery.refetch();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  }

  render() {
    const extendedProps = {
      ...this.props,
      deals: this.state.deals,
      saveDeal: this.saveDeal,
      removeDeal: this.removeDeal,
      moveDeal: this.moveDeal
    };

    return <Stage {...extendedProps} />;
  }
}

StageContainer.propTypes = {
  state: PropTypes.object,
  stageId: PropTypes.string,
  dealsFromDb: PropTypes.array,
  addMutation: PropTypes.func,
  editMutation: PropTypes.func,
  removeMutation: PropTypes.func,
  dealsChange: PropTypes.func,
  dealsChangeMutation: PropTypes.func,
  dealsUpdateOrder: PropTypes.func,
  stageDetailQuery: PropTypes.object
};

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
  })
)(StageContainer);

class StageWithDeals extends React.Component {
  render() {
    const {
      dealsQuery,
      stageDetailQuery,
      dealsChangeMutation,
      dealsUpdateOrderMutation
    } = this.props;

    if (dealsQuery.loading || stageDetailQuery.loading) {
      return <Spinner />;
    }

    const stage = stageDetailQuery.dealStageDetail;
    const dealsFromDb = dealsQuery.deals;

    const dealsUpdateOrder = (orders, callback) => {
      dealsUpdateOrderMutation({
        variables: { orders }
      })
        .then(() => {
          callback();
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    // if move to other stage, will change stageId and pipelineId
    const dealsChange = (_id, stageId) => {
      dealsChangeMutation({
        variables: { _id, stageId }
      });
    };

    const extendedProps = {
      ...this.props,
      stage,
      dealsFromDb,
      dealsUpdateOrder,
      dealsChange
    };

    return <StageContainerWithData {...extendedProps} />;
  }
}

StageWithDeals.propTypes = {
  stageDetailQuery: PropTypes.object,
  dealsQuery: PropTypes.object,
  dealsChangeMutation: PropTypes.func,
  dealsUpdateOrderMutation: PropTypes.func
};

export default compose(
  graphql(gql(queries.deals), {
    name: 'dealsQuery',
    options: ({ stageId }) => ({
      variables: {
        stageId
      }
    })
  }),
  graphql(gql(queries.stageDetail), {
    name: 'stageDetailQuery',
    options: ({ stageId }) => ({
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
)(StageWithDeals);

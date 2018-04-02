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

    const { deals } = props;

    this.state = { deals: [...deals] };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.state !== nextProps.state) {
      const {
        state: { type, index, itemId },
        stageId,
        stageDetailQuery,
        dealsQuery,
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
          dealsQuery.refetch();
        })
        .catch(error => {
          Alert.error(error.message);
        });

      this.setState({ deals });
    }
  }

  // create or update deal
  saveDeal(doc, callback, deal) {
    const {
      addMutation,
      editMutation,
      stageDetailQuery,
      dealsQuery
    } = this.props;

    console.log('doc: ', doc);

    const { deals } = this.state;
    const { __ } = this.context;

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
        Alert.success(__('Successfully saved.'));

        // if edit mode
        if (deal) {
          const index = deals.findIndex(d => d._id === data.dealsEdit._id);

          deals[index] = data.dealsEdit;
        } else {
          deals.push(data.dealsAdd);
        }

        this.setState({ deals });

        stageDetailQuery.refetch();
        dealsQuery.refetch();

        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  }

  // remove deal
  removeDeal(_id) {
    const { removeMutation, stageDetailQuery, dealsQuery } = this.props;
    const { deals } = this.state;
    const { __ } = this.context;

    confirm().then(() => {
      removeMutation({
        variables: { _id }
      })
        .then(({ data: { dealsRemove } }) => {
          Alert.success(__('Successfully deleted.'));

          this.setState({
            deals: deals.filter(el => el._id !== dealsRemove._id)
          });

          stageDetailQuery.refetch();
          dealsQuery.refetch();
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  }

  // move deal
  moveDeal(doc) {
    const { dealsChangeMutation, stageDetailQuery, dealsQuery } = this.props;
    const { __ } = this.context;

    dealsChangeMutation({
      variables: doc
    })
      .then(() => {
        Alert.success(__('Successfully moved.'));

        stageDetailQuery.refetch();
        dealsQuery.refetch();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  }

  render() {
    const { stageDetailQuery } = this.props;

    if (stageDetailQuery.loading) {
      return <Spinner />;
    }

    const extendedProps = {
      ...this.props,
      deals: this.state.deals,
      saveDeal: this.saveDeal,
      removeDeal: this.removeDeal,
      moveDeal: this.moveDeal,
      stage: stageDetailQuery.dealStageDetail
    };

    return <Stage {...extendedProps} />;
  }
}

StageContainer.propTypes = {
  state: PropTypes.object,
  stageId: PropTypes.string,
  deals: PropTypes.array,
  addMutation: PropTypes.func,
  editMutation: PropTypes.func,
  removeMutation: PropTypes.func,
  dealsChange: PropTypes.func,
  dealsChangeMutation: PropTypes.func,
  dealsUpdateOrder: PropTypes.func,
  stageDetailQuery: PropTypes.object,
  dealsQuery: PropTypes.object,
  dealsUpdateOrderMutation: PropTypes.func
};

StageContainer.contextTypes = {
  __: PropTypes.func
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
)(StageContainer);

class StageWithDeals extends React.Component {
  render() {
    const { dealsQuery } = this.props;

    if (dealsQuery.loading) {
      return <Spinner />;
    }

    const deals = dealsQuery.deals;

    const extendedProps = {
      ...this.props,
      deals
    };

    return <StageContainerWithData {...extendedProps} />;
  }
}

StageWithDeals.propTypes = {
  dealsQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.deals), {
    name: 'dealsQuery',
    options: ({ stageId }) => ({
      variables: {
        stageId
      }
    })
  })
)(StageWithDeals);

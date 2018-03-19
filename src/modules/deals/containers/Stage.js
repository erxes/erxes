import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Stage } from '../components';
import { queries, mutations } from '../graphql';
import { Alert, confirm } from 'modules/common/utils';
import { Spinner } from 'modules/common/components';
import { listObjectUnFreeze } from 'modules/common/utils';
import { moveInList, collectOrders } from '../utils';

class StageContainer extends React.Component {
  constructor(props) {
    super(props);

    const { collectDeals, stage, dealsFromDb } = props;

    collectDeals(stage._id, listObjectUnFreeze(dealsFromDb));
  }

  componentWillReceiveProps(nextProps) {
    if (
      JSON.stringify(this.props.dealResult) !==
      JSON.stringify(nextProps.dealResult)
    ) {
      const {
        dealResult: { source, destination, draggableId },
        deals,
        stage,
        collectDeals,
        dealsUpdateOrder,
        dealsChange
      } = nextProps;

      if (
        source.droppableId === stage._id &&
        destination.droppableId === stage._id
      ) {
        // Move within list
        const movedList = moveInList(deals, source.index, destination.index);

        collectDeals(stage._id, movedList);

        dealsUpdateOrder(collectOrders(movedList));
      } else if (source.droppableId === stage._id) {
        // Remove from list
        deals.splice(source.index, 1);

        collectDeals(stage._id, deals);

        dealsUpdateOrder(collectOrders(deals));
      } else if (destination.droppableId === stage._id) {
        // Add to list
        deals.splice(destination.index, 0, { _id: draggableId });

        collectDeals(stage._id, deals);

        dealsUpdateOrder(collectOrders(deals));

        dealsChange(draggableId, stage._id);
      }
    }
  }

  render() {
    const {
      collectDeals,
      addToDeals,
      stage,
      deals,
      addMutation,
      editMutation,
      removeMutation,
      dealsChangeMutation
    } = this.props;

    // create or update deal
    const saveDeal = (doc, callback, deal) => {
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

          collectDeals(stage._id, deals);

          callback();
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    // remove deal
    const removeDeal = (_id, callback) => {
      confirm().then(() => {
        removeMutation({
          variables: { _id }
        })
          .then(({ data: { dealsRemove } }) => {
            Alert.success('Successfully deleted.');

            const filteredDeals = deals.filter(d => d._id !== dealsRemove._id);

            collectDeals(stage._id, filteredDeals);

            callback();
          })
          .catch(error => {
            Alert.error(error.message);
          });
      });
    };

    // move deal
    const moveDeal = (doc, callback) => {
      dealsChangeMutation({
        variables: doc
      })
        .then(({ data: { dealsChange } }) => {
          Alert.success('Successfully moved.');

          const filteredDeals = deals.filter(d => d._id !== dealsChange._id);

          // update source list
          collectDeals(stage._id, filteredDeals);

          // update destination list
          addToDeals(dealsChange.stageId, { _id: dealsChange._id });

          callback();
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const extendedProps = {
      ...this.props,
      saveDeal,
      removeDeal,
      moveDeal
    };

    return <Stage {...extendedProps} />;
  }
}

StageContainer.propTypes = {
  collectDeals: PropTypes.func,
  stage: PropTypes.object,
  dealsFromDb: PropTypes.array,
  deals: PropTypes.array,
  addMutation: PropTypes.func,
  editMutation: PropTypes.func,
  removeMutation: PropTypes.func,
  dealsChange: PropTypes.func,
  dealsChangeMutation: PropTypes.func,
  dealResult: PropTypes.object,
  addToDeals: PropTypes.func,
  dealsUpdateOrder: PropTypes.func
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
      dealsChangeMutation,
      dealsUpdateOrderMutation
    } = this.props;

    if (dealsQuery.loading) {
      return <Spinner />;
    }

    const dealsUpdateOrder = orders => {
      dealsUpdateOrderMutation({
        variables: { orders }
      }).catch(error => {
        Alert.error(error.message);
      });
    };

    // if move to other stage, will change stageId and pipelineId
    const dealsChange = (_id, stageId) => {
      dealsChangeMutation({
        variables: { _id, stageId }
      });
    };

    const dealsFromDb = dealsQuery.deals;

    const extendedProps = {
      ...this.props,
      dealsFromDb,
      dealsUpdateOrder,
      dealsChange
    };

    return <StageContainerWithData {...extendedProps} />;
  }
}

StageWithDeals.propTypes = {
  dealsQuery: PropTypes.object,
  dealsChangeMutation: PropTypes.func,
  dealsUpdateOrderMutation: PropTypes.func
};

export default compose(
  graphql(gql(queries.deals), {
    name: 'dealsQuery',
    options: ({ stage }) => ({
      variables: {
        stageId: stage._id
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

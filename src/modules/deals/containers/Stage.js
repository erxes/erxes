import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Stage } from '../components';
import { queries, mutations } from '../graphql';
import { Alert, confirm } from 'modules/common/utils';
import { Spinner } from 'modules/common/components';
import { listObjectUnFreeze } from 'modules/common/utils';

class StageContainer extends React.Component {
  constructor(props) {
    super(props);

    const { dealsFromDb } = props;

    this.state = {
      deals: listObjectUnFreeze(dealsFromDb)
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.state !== nextProps.state) {
      const { deals } = this.state;
      const { type, index, itemId } = nextProps.state;

      if (type === 'removeItem') {
        // Remove from list
        deals.splice(index, 1);
      }

      if (type === 'addItem') {
        // Add to list
        deals.splice(index, 0, { _id: itemId });
      }

      this.setState({ deals });
    }
  }

  render() {
    const {
      addToDeals,
      addMutation,
      editMutation,
      removeMutation,
      dealsChangeMutation
    } = this.props;

    const { deals } = this.state;

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
          .then(() => {
            Alert.success('Successfully deleted.');

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
      deals,
      saveDeal,
      removeDeal,
      moveDeal
    };

    return <Stage {...extendedProps} />;
  }
}

StageContainer.propTypes = {
  state: PropTypes.object,
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

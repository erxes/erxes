import * as React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { Stage } from '../components';
import { queries, mutations } from '../graphql';
import {
  collectOrders,
  saveDeal as save,
  removeDeal as remove
} from '../utils';

class StageContainer extends React.Component {
  constructor(props) {
    super(props);

    this.saveDeal = this.saveDeal.bind(this);
    this.removeDeal = this.removeDeal.bind(this);

    const { deals } = props;

    this.state = { deals: [...deals] };
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
  saveDeal(doc, callback, deal) {
    const {
      stageDetailQuery,
      addMutation,
      editMutation,
      dealsQuery
    } = this.props;

    const { deals } = this.state;
    const { __ } = this.context;

    save(
      doc,
      { addMutation, editMutation, dealsQuery },
      { __ },
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
  removeDeal(_id) {
    const { stageDetailQuery, removeMutation, dealsQuery } = this.props;
    const { deals } = this.state;
    const { __ } = this.context;

    remove(_id, { removeMutation, dealsQuery }, { __ }, dealsRemove => {
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

StageContainer.propTypes = {
  state: PropTypes.object,
  stageId: PropTypes.string,
  deals: PropTypes.array,
  addMutation: PropTypes.func,
  editMutation: PropTypes.func,
  removeMutation: PropTypes.func,
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

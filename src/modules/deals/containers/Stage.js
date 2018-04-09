import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Stage } from '../components';
import { WithAction } from '../containers';
import { queries, mutations } from '../graphql';
import { Alert } from 'modules/common/utils';
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
    if (nextProps.state) {
      const {
        state: { type, index, itemId },
        stageId,
        stageDetailQuery,
        dealsQuery,
        dealsChangeMutation,
        dealsUpdateOrderMutation
      } = nextProps;

      const { deals } = this.state;

      console.log('nextProps.state: ', nextProps.state);

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

      console.log('orders: ', orders);
      console.log('deals: ', deals);

      dealsUpdateOrderMutation({
        variables: { orders }
      })
        .then(() => {
          stageDetailQuery.refetch();

          console.log('dealsQuery: ', dealsQuery);

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
    const { deals } = this.state;
    const { stageDetailQuery } = this.props;

    this.props.saveDeal(
      doc,
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
    const { deals } = this.state;
    const { stageDetailQuery } = this.props;

    this.props.removeDeal(_id, dealsRemove => {
      this.setState({
        deals: deals.filter(el => el._id !== dealsRemove._id)
      });

      stageDetailQuery.refetch();
    });
  }

  // move deal
  moveDeal(doc) {
    const { stageDetailQuery } = this.props;

    this.props.moveDeal(doc, () => {
      stageDetailQuery.refetch();
    });
  }

  render() {
    const { stageDetailQuery } = this.props;

    if (stageDetailQuery.loading) {
      return <Spinner />;
    }

    // console.log(
    //   'stageDetailQuery.dealStageDetail: ',
    //   stageDetailQuery.dealStageDetail
    // );

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
  dealsQuery: PropTypes.object,
  saveDeal: PropTypes.func,
  removeDeal: PropTypes.func,
  moveDeal: PropTypes.func,
  dealsChange: PropTypes.func,
  dealsChangeMutation: PropTypes.func,
  dealsUpdateOrder: PropTypes.func,
  stageDetailQuery: PropTypes.object,
  dealsUpdateOrderMutation: PropTypes.func
};

StageContainer.contextTypes = {
  __: PropTypes.func
};

const StageContainerWithData = compose(
  graphql(gql(queries.stageDetail), {
    name: 'stageDetailQuery',
    options: props => {
      // console.log('props: ', props);

      const v = {
        variables: {
          _id: props.stageId
        }
      };

      return v;
    }
  }),
  graphql(gql(mutations.dealsUpdateOrder), {
    name: 'dealsUpdateOrderMutation'
  }),
  graphql(gql(mutations.dealsChange), {
    name: 'dealsChangeMutation'
  })
)(StageContainer);

class StageWithActionContainer extends React.Component {
  render() {
    const { stageId } = this.props;

    const StageWithAction = WithAction(StageContainerWithData, { stageId });

    return <StageWithAction {...this.props} />;
  }
}

StageWithActionContainer.propTypes = {
  stageId: PropTypes.string
};

export default StageWithActionContainer;

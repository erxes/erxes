import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Pipeline } from '../components';
import { queries, mutations } from '../graphql';
import { Spinner } from 'modules/common/components';
import { Alert, listObjectUnFreeze } from 'modules/common/utils';
import { collectOrders } from '../utils';

class PipelineContainer extends React.Component {
  constructor(props) {
    super(props);

    const { stagesFromDb } = props;

    this.state = {
      stages: listObjectUnFreeze(stagesFromDb)
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.state !== nextProps.state) {
      const {
        state: { type, index, itemId },
        pipeline,
        stagesUpdateOrder,
        stagesChange
      } = nextProps;
      const { stages } = this.state;

      if (type === 'removeItem') {
        // Remove from list
        stages.splice(index, 1);

        stagesUpdateOrder(collectOrders(stages));
      }

      if (type === 'addItem') {
        // Add to list
        stages.splice(index, 0, { _id: itemId });

        stagesUpdateOrder(collectOrders(stages));
        stagesChange(itemId, pipeline._id);
      }

      this.setState({ stages });
    }
  }

  render() {
    const extendedProps = {
      ...this.props,
      stages: this.state.stages
    };

    return <Pipeline {...extendedProps} />;
  }
}

const propTypes = {
  pipeline: PropTypes.object,
  state: PropTypes.object,
  stagesFromDb: PropTypes.array,
  stagesUpdateOrder: PropTypes.func,
  stagesChange: PropTypes.func
};

PipelineContainer.propTypes = propTypes;

class StagesWithPipeline extends React.Component {
  render() {
    const {
      stagesQuery,
      stagesUpdateOrderMutation,
      stagesChangeMutation
    } = this.props;

    if (stagesQuery.loading) {
      return <Spinner />;
    }

    const stagesFromDb = stagesQuery.dealStages;

    const stagesUpdateOrder = orders => {
      stagesUpdateOrderMutation({
        variables: { orders }
      }).catch(error => {
        Alert.error(error.message);
      });
    };

    // if move to other pipeline, will change pipelineId
    const stagesChange = (_id, pipelineId) => {
      stagesChangeMutation({
        variables: { _id, pipelineId }
      });
    };

    const extendedProps = {
      ...this.props,
      stagesFromDb,
      stagesUpdateOrder,
      stagesChange
    };

    return <PipelineContainer {...extendedProps} />;
  }
}

StagesWithPipeline.propTypes = {
  stagesQuery: PropTypes.object,
  stagesUpdateOrderMutation: PropTypes.func,
  stagesChangeMutation: PropTypes.func
};

export default compose(
  graphql(gql(queries.stages), {
    name: 'stagesQuery',
    options: ({ pipeline }) => ({
      variables: {
        pipelineId: pipeline._id
      }
    })
  }),
  graphql(gql(mutations.stagesUpdateOrder), {
    name: 'stagesUpdateOrderMutation'
  }),
  graphql(gql(mutations.stagesChange), {
    name: 'stagesChangeMutation'
  })
)(StagesWithPipeline);
